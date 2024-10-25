const Post = require("../models/post");
const User = require("../models/user");

// Create and save a new Post
exports.create = async (req, res) => {
    if (!req.body || Object.keys(req.body).length === 0) {
        res.status(400).send({
            message: "Post cannot be empty."
        });
    }

    try {
        const possibleUserId = req.body.userId

        // First check if the user exists
        const userPosting = await User.findById(possibleUserId);

        if (!userPosting) {
            return res.status(404).send(`User with userId=${possibleUserId} not found`)
        }

        // create the post
        const newPost = new Post({
            content: req.body.content,
            is_event: req.body.is_event,
            user: req.body.userId
        });

        newPost.save();

        //add post to user
        userPosting.posts.unshift(newPost._id)
        userPosting.save();

        return res.send(newPost);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ message: err.message || "server error." });
    }
};

// Find a single post with an id
exports.findOne = (req, res) => {
    const id = req.params.id;
    const cookies = req.cookies

    Post.findById(id)
        .then(data => {
            if (!data)
                return res.status(404).send({ message: `Post not found with id=${id}` });
            else res.send(data);
        })
        .catch(err => {
            return res.status(500).send({
                message: `Error retrieving post with id=${id}`,
                error: err.message || 'Unexpected Error'
            }
            );
        });
};

exports.findAll = (req, res) => {
    Post.find()
        .then(data => {
            if (!data)
                return res.status(404).send({ message: "No posts found" });
            else res.send(data);
        })
        .catch(err => {
            return res.status(500).send({
                message: "Error retreiving all posts",
                error: err.message || "Unexpected Error"
            })
        })
}

// Update a post by the id
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update post cannot be empty."
        });
    }

    const id = req.params.id;

    Post.findByIdAndUpdate(id, req.body, { runValidators: true })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot find Post with id=${id}`
                });
            } else res.send({ message: "Post updated successfully." })
        })
        .catch(err => {
            res.status(500).send({
                message: `Error updating post with id=${id}`,
                error: err
            });
        });
};

// Delete a post by the id
exports.delete = async (req, res) => {
    const id = req.params.id;

    try {
        const curPost = await Post.findById(id).exec()
        if (!curPost) {
            return res.status(404).send({
                message: `Cannot find post with id=${id}`
            });
        }

        const curUser = await User.findById(curPost.user).exec()

        const postIndex = curUser.posts.indexOf(curPost._id)
        if (postIndex > -1) {
            curUser.posts = curUser.posts.splice(postIndex, 1)
            curUser.save()
        } else {
            return res.status(500).send({ message: `UserId=${curPost.user} in Post cannot be found`})
        }

        await Post.findByIdAndDelete(id)
        return res.send({
            message: "Post deleted successfully."
        });

    } catch (err) {
        return res.status(500).send({
            message: `Error deleting post with id=${id}`,
            error: err.message || `Unexpected Error`
        })
    }
};

// Like or Unlike a post
exports.toggleLike = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Request body cannot be empty."
        });
    }

    const postId = req.body.postId;
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

        const likedPosts = myUser.likedPosts || [];
        const isAlreadyLiked = likedPosts.includes(postId);

        if (like && !isAlreadyLiked) {
            // Increment like
            post.likes += 1;
            myUser.likedPosts.push(postId);
        } else if (!like && isAlreadyLiked) {
            // Decrement like
            post.likes -= 1;
            myUser.likedPosts = likedPosts.filter(id => id !== postId);
        } else {
            return res.status(400).send({ message: "Invalid operation." });
        }

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