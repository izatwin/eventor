const Post = require("../models/post");
const User = require("../models/user");
const Comment = require("../models/comment")
const Common = require(`./common.controller`)
const BaseEvent = require("../models/event")
const mongoose = require("mongoose");

const textfilter = require("../modules/textfilter.js");

// Create and save a new Post
exports.create = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).send({
            message: "Post cannot be empty."
        });
    }

    let authenticatedUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    try {
        // Check for profanity
        if (textfilter.containsProfanity(req.body.content)) {
            res.status(422).json({ message: "Post content contains profanity." });
            return;
        }

        // Create the post
        const newPost = new Post({
            content: req.body.content,
            is_event: req.body.is_event,
            embeddedImage: req.body.embeddedImage,
            user: authenticatedUser._id
        });

        await newPost.save();

        // Add post to user's posts list
        authenticatedUser.posts.unshift(newPost._id);
        await authenticatedUser.save();

        return res.send(newPost);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message || "server error." });
    }
};

// Find a single post with an id
exports.findOne = async (req, res) => {
    let authenticatedUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const postId = req.params.id;

    try {
        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.status(404).send({ message: `Post not found with id=${postId}` });
        }

        const postAuthor = await User.findById(post.user).exec();

        if (!postAuthor) {
            return res.status(404).send({ message: `Author not found for post with id=${postId}` });
        }

        // Check blocking conditions
        var isBlockingThem = false
        var isBlockedByThem = false
        if (typeof authenticatedUser.blockedUsers !== 'undefined') {
            isBlockingThem = authenticatedUser.blockedUsers.includes(postAuthor._id.toString());
        }

        if (typeof postAuthor.blockedUsers !== 'undefined') {
            isBlockedByThem = postAuthor.blockedUsers.includes(authenticatedUser._id.toString());
        }

        if (isBlockingThem || isBlockedByThem) {
            return res.status(403).send({ message: "Access to this post is denied." });
        }

        // If authenticated and not blocked, send post data
        return res.send(post);

    } catch (err) {
        return res.status(500).send({
            message: `Error retrieving post with id=${postId}`,
            error: err.message || 'Unexpected Error'
        });
    }
};

// Find all posts by a specific user
exports.findAllPostsByUser = async (req, res) => {
    let authenticatedUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const targetUserId = req.params.id;

    try {
        const targetUser = await User.findById(targetUserId).exec();

        if (!targetUser) {
            return res.status(404).send({ message: `User not found with id=${targetUserId}` });
        }

        // Check blocking conditions
        const isBlockingThem = authenticatedUser.blockedUsers.includes(targetUser._id.toString());
        const isBlockedByThem = targetUser.blockedUsers.includes(authenticatedUser._id.toString());

        if (isBlockingThem || isBlockedByThem) {
            return res.status(403).send({ message: "Access to this user's posts is denied." });
        }

        const posts = await Post.find({ user: targetUserId }).sort({ timestamp: -1 }).exec();

        return res.send(posts);

    } catch (err) {
        return res.status(500).send({
            message: `Error retrieving posts for user id=${targetUserId}`,
            error: err.message || 'Unexpected Error'
        });
    }
};

// Update a post by the id
exports.update = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update post cannot be empty."
        });
    }

    let authenticatedUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;
    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }
    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const id = req.params.id;

    try {
        const post = await Post.findById(id);

        if (!post) {
            return res.status(404).send({
                message: `Post not found with id=${id}`
            });
        }

        if (post.user.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).send({
                message: "You are not allowed to update someone else's post."
            });
        }

        // Check for profanity
        if (textfilter.containsProfanity(req.body.content)) {
            res.status(422).json({ message: "Post content contains profanity." });
            return;
        }

        const updatedPost = await Post.findByIdAndUpdate(id, req.body, { runValidators: true, new: true });
        return res.send({ message: "Post updated successfully.", post: updatedPost });
    } catch (err) {
        return res.status(500).send({
            message: `Error updating post with id=${id}`,
            error: err.message || "Unexpected Error"
        });
    }
};

// Delete a post by the id
exports.delete = async (req, res) => {
    let authenticatedUser = null;
    let authenticated = false;
    let req_cookies = req.cookies;

    if (req_cookies) {
        let user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                let auth_token = req_cookies.auth_token;
                if (auth_token) {
                    let userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    const id = req.params.id;

    try {
        const post = await Post.findById(id);
        if (!post) {
            return res.status(404).send({
                message: `Cannot find post with id=${id}`
            });
        }

        if (post.user.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).send({
                message: "You are not allowed to delete someone else's post."
            });
        }

        // If there is an attached event, delete it
        if (post.is_event && post.eventId) {
            await BaseEvent.findByIdAndDelete(post.eventId);
        }

        // Remove the post reference from the user's posts
        const postIndex = authenticatedUser.posts.indexOf(post._id);
        if (postIndex > -1) {
            authenticatedUser.posts.splice(postIndex, 1);
            await authenticatedUser.save();
        }

        // Delete any comments that are also with the post
        await Comment.deleteMany({ _id: { $in: post.comments}})

        await Post.findByIdAndDelete(id);

        return res.send({
            message: "Post and its attached event deleted successfully."
        });

    } catch (err) {
        return res.status(500).send({
            message: `Error deleting post with id=${id}`,
            error: err.message || "Unexpected Error"
        });
    }
};

// Like or Unlike a post
exports.toggleLike = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Request body cannot be empty."
        });
    }

    const postId = new mongoose.Types.ObjectId(req.body.postId);
    const like = req.body.like; // Expect a boolean to indicate like or unlike

    let authenticated = false;
    let reqCookies = req.cookies;
    let myUser;

    if (reqCookies) {
        let userId = reqCookies.user_id;
        if (userId) {
            myUser = await User.findById(userId).exec();
            if (myUser) {
                let authToken = reqCookies.auth_token;
                if (authToken) {
                    const userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(authToken)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    try {
        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.status(404).send({ message: `Post not found with id=${postId}` });
        }

        var likedPosts = myUser.likedPosts || [];
        const isAlreadyLiked = likedPosts.includes(postId);

        if (like && !isAlreadyLiked) {
            // Increment like
            post.likes += 1;
            likedPosts.push(postId);
        } else if (!like && isAlreadyLiked) {
            // Decrement like
            post.likes -= 1;
            likedPosts = likedPosts.filter(id => !id.equals(postId));
        } else {
            return res.status(400).send({ message: "Invalid operation." });
        }

        myUser.likedPosts = likedPosts;
        myUser.markModified('likedPosts');
        await post.save();
        await myUser.save();

        return res.status(200).send({ message: "Post like status updated." });

    } catch (err) {
        return res.status(500).send({
            message: `Error updating like status for post with id=${postId}`,
            error: err.message || "Unexpected Error"
        });
    }
};

// Record a view or share for a post
exports.viewOrSharePost = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Request body cannot be empty."
        });
    }

    const postId = req.body.postId;
    const actionType = req.body.actionType; // Expect 'view' or 'share'

    if (!['view', 'share'].includes(actionType)) {
        return res.status(400).send({
            message: "Invalid action type. Expect 'view' or 'share'."
        });
    }

    try {
        const post = await Post.findById(postId).exec();
        if (!post) {
            return res.status(404).send({ message: `Post not found with id=${postId}` });
        }

        if (actionType === 'view') {
            post.views += 1;
        } else if (actionType === 'share') {
            post.shares += 1;
        }

        await post.save();

        return res.status(200).send({ message: `Post ${actionType} count updated.` });

    } catch (err) {
        return res.status(500).send({
            message: `Error updating ${actionType} count for post with id=${postId}`,
            error: err.message || "Unexpected Error"
        });
    }
};

exports.getFeed = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Request body cannot be empty."
        });
    }

    let authenticated = false;
    let reqCookies = req.cookies;
    let myUser;

    if (reqCookies) {
        let userId = reqCookies.user_id;
        if (userId) {
            myUser = await User.findById(userId).exec();
            if (myUser) {
                let authToken = reqCookies.auth_token;
                if (authToken) {
                    const userCredentials = myUser.userCredentials;
                    if (userCredentials.matchAuthToken(authToken)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    if (!authenticated) {
        return res.status(400).send({
            message: "Not logged in!"
        });
    }

    // get followed list
    const followingList = myUser.following;
    let feedIds = []

    // for each person followed, get their posts
    for (var followedUserId of followingList) {
        // get their posts by first checking if the person is blocking them
        let followedUser = await User.findById(followedUserId);
        let followedUserBlockList = followedUser.blockedUsers || []

        if (!(followedUserBlockList.includes(myUser._id))) {
            feedIds.push(...followedUser.posts)
        }
    }

    // then if not, get their posts
    const postIdsCorrectType = feedIds.map(id => new mongoose.Types.ObjectId(id))

    Post.find({ _id: { $in: postIdsCorrectType } })
        .sort({ timestamp: -1 }) // Use 1 for ascending, -1 for descending
        .then(posts => {
            res.send(posts)
        })
        .catch(error => {
            console.error(error);
        });
}

// Searching
exports.searchPosts = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Request body cannot be empty."
        });
    }

    const query = req.body.query;
    const category = req.body.category;

    if (!(query && category)) {
        return res.status(400).send({
            message: "Query and category parameters are required for searching."
        });
    }

    const safeQuery = Common.escapeRegExp(query);
    const regex = new RegExp(safeQuery, 'i');

    try {
        let foundPosts = [];

        if (category === 'postContent') {
            // Search the posts based on their content
            foundPosts = await Post.find({
                content: { $regex: regex }
            }).exec();
        } else if (category === 'eventTitle' || category === 'eventLocation') {
            // Search for posts with events
            const eventField = category === 'eventTitle' ? 'eventName' : 'location';

            // Get all posts with events matching the category and query
            const postsWithEvents = await Post.find({
                is_event: true,
                eventId: { $exists: true }
            }).exec();

            // Retrieve eventIds from the posts to perform a search on events
            const eventIds = postsWithEvents.map(post => post.eventId);

            // Find events that match the category criteria
            const foundEvents = await BaseEvent.find({
                _id: { $in: eventIds },
                [eventField]: { $regex: regex }
            }).exec();

            // Find the corresponding posts for matched events
            foundPosts = postsWithEvents.filter(post => foundEvents.some(event => event._id.equals(post.eventId)));
        } else {
            return res.status(400).send({
                message: "Invalid category for search. Use 'postContent', 'eventTitle', or 'eventLocation'."
            });
        }

        return res.status(200).send(foundPosts);
    } catch (err) {
        return res.status(500).send({
            message: "Error occurred during search.",
            error: err.message || "Unexpected Error"
        });
    }
};