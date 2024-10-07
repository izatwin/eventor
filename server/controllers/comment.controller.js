const Comment = require('../models/comment');

// Create a save a new comment
exports.create = (req, res) => {
    const newComment = new Comment({
        text: req.body.text,
        isRoot: req.body.isRoot,
    });

    newComment.save(newComment)
    .then(data => {
        res.send(data);
    })
    .catch(err => {
        res.status(500).json({
            message: err.message || "server error."
        });
    });
};