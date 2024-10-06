const Post = require("../models/post")

// Create and save a new Post
exports.create = (req, res) => {
    // Somehow validate request, although I think this can be done
    // Using the mongoose schema with constraint validation

    const newPost = new Post({
        content: req.body.content,
        event: req.body.event
    });

    newPost.save(newPost)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).json({
            message: err.message || "server error."
        });
    });
};

// Find all Posts from the database
exports.findAll = (req, res) => {

};

// Find a single post with an id
exports.findOne = (req, res) => {

};

// Update a post by the id
exports.update = (req, res) => {

};

// Delete a post by the id
exports.delete = (req, res) => {

};

// Delete all the posts
exports.deleteAll = (req, res) => {

}

// Find all posts
exports.findAllPublished = (req, res) => {

};