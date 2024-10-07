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

exports.addComment = async (req, res) => {
    try {
        const comment = await Comment.findById(req.body.parentId).exec();
        if (!comment) {
            return res.status(404).send("Parent comment not found.");
        }
        const AddComment = await Comment.findById(req.body.childId).exec();
        if (!AddComment) {
            return res.status(404).send("Child comment not found");
        }

        if (!comment.isRoot) {
            return res.send("Parent comment is not Root");
        }

        comment.comments.push(AddComment._id);
        comment.save(comment)
        res.send(comment)
    } catch (error) {
        res.status(500).send(error.message);
    }

};