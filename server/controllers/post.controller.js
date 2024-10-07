const Post = require("../models/post")

// Create and save a new Post
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Post cannot be empty."
        });
    }

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

// Find a single post with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

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

// Update a post by the id
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update post cannot be empty."
        });
    }

    const id = req.param.id;

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
exports.delete = (req, res) => {
    const id = req.params.id;

    Post.findOneAndDelete(id)
    .then(data => {
        if (!data) {
            return res.status(404).send({
                message: `Cannot find post with id=${id}`,
                data: data
            });
        } else {
            return res.send({
                message: "Post deleted successfully."
            });
        }
    })
    .catch(err => {
        return res.status(500).send({
            message: `Error deleting post with id=${id}`,
            error: err.message || `Unexpected Error`
        })
    })
};