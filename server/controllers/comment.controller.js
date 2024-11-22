const Comment = require('../models/comment');
const User = require("../models/user");
const Post = require("../models/post");
const Common = require(`./common.controller`)
const mongoose = require("mongoose");

const textfilter = require("../modules/textfilter.js");
const comment = require('../models/comment');

// Create a save a new comment
exports.create = async (req, res) => {
    const authenticatedUser = await Common.authenticateUser(req);
    if (!authenticatedUser) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    if (!req.body) {
        return res.status(400).send({
            message: "Body cannot be empty."
        });
    }

    const postId = req.body.postId;
    const commentFields = req.body.comment;

    for (field in commentFields) {
        let val = commentFields[field]
        if (textfilter.containsProfanity(val)) {
            res.status(422).json({ message: "Comment content contains profanity." });
            return;
        }
    }

    try {
        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.status(404).send({ message: `Post not found with id=${postId}` });
        }

        const postAuthor = await User.findById(post.user).exec();

        const postAuthorBlockedUsers = postAuthor.blockedUsers || []

        if (postAuthorBlockedUsers.includes(authenticatedUser._id)) {
            return res.status(403).send({ message: "Access to comment to this post is denied." });
        }
        
        const newComment = new Comment({
            ...commentFields,
            user: authenticatedUser._id,
        });

        await newComment.save();

        post.comments.unshift(newComment._id)
        await post.save();

        return res.send(newComment);
    } catch (err) {
        return res.status(500).send({
            message: "Error creating comment.",
            error: err.message
        });
    }
};

exports.findOne = async (req, res) => {
    const authenticatedUser = await Common.authenticateUser(req);
    if (!authenticatedUser) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const commentId = req.params.id;

    try {
        const comment = await Comment.findById(commentId).exec();
        if (!comment) {
            return res.status(404).send({ message: `Comment not found with id=${commentId}` });
        }

        return res.send(comment)
        
    } catch (err) {
        return res.status(500).send({
            message: `Error retrieving post with id=${postId}`,
            error: err.message || 'Unexpected Error'
        });
    }
}

exports.findCommentsOnPost = async (req, res) => {
    const authenticatedUser = await Common.authenticateUser(req);
    if (!authenticatedUser) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.status(404).send({ message: `Post not found with id=${postId}` });
        }
        const commentIdsCorrectType = post.comments.map(id => new mongoose.Types.ObjectId(id))

        const comments = await Comment.find({_id: { $in: commentIdsCorrectType}}).sort({ timestamp: -1 }).exec();
        if (!comments) {
            return res.status(404).send({ message: `Comment not found with id=${commentId}` });
        }

        return res.send(comments)
        
    } catch (err) {
        return res.status(500).send({
            message: `Error retrieving post with id=${postId}`,
            error: err.message || 'Unexpected Error'
        });
    }
}

exports.addComment = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Child comment cannot be empty."
        });
    }

    const parentId = req.params.id;
    const childId = req.body.childId;

    try {
        const childComment = await Comment.findById(childId).exec();
        if (!childComment) {
            return res.status(402).send({ message: `Cannot find child comment with id=${childId}` });
        }

        const parentComment = await Comment.findById(parentId).exec();
        
        if (!parentComment) {
            return res.status(403).send({ message: `Cannot find parent comment with id=${parentId}` });
        }

        if (!parentComment.isRoot) {
            return res.status(403).send({message: 'Cannot add child to nonroot comment'})
        }

        parentComment.comments.push(childComment._id);
        const updatedComment = await parentComment.save();

        return res.send(
            updatedComment
        );
    } catch (err) {
        return res.status(500).send({
            message: `Error adding child comment id=${childId} to parent comment id=${parentId}`,
            error: err
        })
    }
};

exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update comment cannot be empty."
        })
    }

    const commentId = req.params.id;

    for (field in req.body) {
        let val = req.body[field]
        if (textfilter.containsProfanity(val)) {
            res.status(422).json({ message: "Comment content contains profanity." });
            return;
        }
    }

    Comment.findByIdAndUpdate(commentId, req.body, { runValidators: true })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot find Comment with id=${commentId}.`
                });
            } else res.send({ message: "Comment updated successfully." })
        })
        .catch(err => {
            res.status(500).send({
                message: `Error updating comment with id=${commentId}`,
                error: err
            });
        });
};

exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const commentToDelete = await Comment.findById(id).exec();
        if (!commentToDelete) {
            return res.status(404).send({
                message: `Cannot find comment with id=${id}`
            });
        }

        let commentsDeleted = 1; // Start by assuming we'll delete the current comment

        if (commentToDelete.isRoot && commentToDelete.comments.length > 0) {
            // If it's a root comment, delete all child comments and count them
            commentsDeleted += commentToDelete.comments.length;
            await Comment.deleteMany({ _id: { $in: commentToDelete.comments } });
        } else {
            // If it's a non-root comment, find and update the parent
            const parentComment = await Comment.findOne({ comments: id }).exec();
            if (parentComment) {
                parentComment.comments = parentComment.comments.filter(childId => !childId.equals(id));
                await parentComment.save();
            }
        }

        // Delete the root or individual child comment
        await Comment.findByIdAndDelete(id);

        // Find and update the post containing this comment 
        const post = await Post.findOne({ comments: id }).exec();
        if (post) {
            post.comments = post.comments.filter(commentId => !commentId.equals(id));
            // Decrement the comment count on the post
            post.commentCount = Math.max(post.commentCount - commentsDeleted, 0);
            await post.save();
        }

        res.send({
            message: "Comment and its child comments (if any) deleted successfully."
        });
    } catch (err) {
        res.status(500).send({
            message: `Error deleting comment with id=${id}`,
            error: err.message || "Unexpected Error"
        });
    }
};

// Like or Unlike a post
exports.toggleLike = async (req, res) => {
    const authenticatedUser = await Common.authenticateUser(req);
    if (!authenticatedUser) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    if (!req.body) {
        return res.status(400).send({
            message: "Request body cannot be empty."
        });
    }

    const commentId = new mongoose.Types.ObjectId(req.body.commentId);
    const like = req.body.like; // Expect a boolean to indicate like or unlike


    try {
        const comment = await Comment.findById(commentId).exec();
        if (!comment) {
            return res.status(404).send({ message: `Comment not found with id=${commentId}` });
        }

        var likedComments = authenticatedUser.likedComments || [];
        const isAlreadyLiked = likedComments.includes(commentId);

        console.log(likedComments);

        if (like && !isAlreadyLiked) {
            // Increment like
            comment.likes += 1;
            likedComments.push(commentId);
        } else if (!like && isAlreadyLiked) {
            // Decrement like
            comment.likes -= 1;
            likedComments = likedComments.filter(id => !id.equals(commentId));
        } else {
            return res.status(400).send({ message: "Invalid operation." });
        }

        authenticatedUser.likedComments = likedComments;
        authenticatedUser.markModified('likedComments');

        console.log(authenticatedUser.likedComments);

        await comment.save();
        await authenticatedUser.save();

        return res.status(200).send({ message: "Comment like status updated." });

    } catch (err) {
        return res.status(500).send({
            message: `Error updating like status for comment with id=${commentId}`,
            error: err.message || "Unexpected Error"
        });
    }
};