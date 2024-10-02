// server/routs/posts.js

const express = require('express');
const router = express.Router();
const Post = require('../models/post');

// POST /api/posts - create a new post
router.post('/', async (req, res) => {
    const {title, content } = req.body;

    try {
        //create the post
        const newPost = new Post({title, content});

        await newPost.save();

        //send back a response
        res.status(201).json({ message: "Post created successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'server error'});
    }
})

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