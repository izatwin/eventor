// server/routs/posts.js

const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const postController = require('../controllers/post.controller')

// POST /api/posts - create a new post
router.post('/', postController.create);

router.get("/:postId", async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId).exec();
        if (!post) {
            return res.status(404).send("Post not found");
        }
        res.send(post);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

module.exports = router;