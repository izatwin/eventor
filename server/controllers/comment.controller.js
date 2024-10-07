const Comment = require('../models/comment');

// Create a save a new comment
exports.create = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Comment cannot be empty."
        });
    }

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

exports.findOne = (req, res) => {
    const id = req.params.id;

    Comment.findById(id)
    .then(data => {
        if (!data)
            res.status(404).send({ message: `Comment not found with id=${id}`})
        else res.send(data);
    })
    .catch(err => {
        res.status(500).send({message: `Error retrieving comment with id=${id}`})
    })
}

exports.addComment = async (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Child comment cannot be empty."
        });
    }

    const parentId = req.params.id;
    const childId = req.body.childId;
    console.log(parentId)

    try {
        const childComment = await Comment.findById(childId).exec();
        if (!childComment) {
            return res.status(404).send({ message: `Cannot find child comment with id=${childId}` });
        }

        const parentComment = await Comment.findByIdAndUpdate(parentId, { $push: { comments: childComment._id } }, { new: true }).exec();
        if (!parentComment) {
            return res.status(404).send({ message: `Cannot find parent comment with id=${parentId}` });
        }

        return res.send({
            message: "Child comment added to parent successfully",
            parent: parentComment
        });
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

    const id = req.param.id;

    Comment.findByIdAndUpdate(id, req.body, { runValidators: true })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot find Comment with id=${id}.`
                });
            } else res.send({ message: "Comment updated successfully." })
        })
        .catch(err => {
            res.status(500).send({
                message: `Error updating comment with id=${id}`,
                error: err
            });
        });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    Comment.findOneAndDelete(id)
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot find comment with id=${id}`
                });
            } else {
                res.send({
                    message: "Comment deleted successfully."
                });
            }
        })
        .catch(err => {
            res.status(500).send({
                message: `Error deleting comment with id=${id}`,
                error: err
            })
        })
}