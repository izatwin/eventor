const Event = require("../models/event")

// Create and save a new Post
exports.create = (req, res) => {
    if (!req.body) {
        res.status(400).send({
            message: "Event cannot be empty."
        });
    }

    const newEvent = new Event({
        content: req.body.content,
        event: req.body.event
    });

    newEvent.save(newEvent)
        .then(data => {
            res.send(data);
        })
        .catch(err => {
            res.status(500).json({
                message: err.message || "server error."
            });
        });
};

// Find a single event with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Event.findById(id)
        .then(data => {
            if (!data)
                return res.status(404).send({ message: `Event not found with id=${id}` });
            else res.send(data);
        })
        .catch(err => {
            return res.status(500).send({
                message: `Error retrieving event with id=${id}`,
                error: err.message || 'Unexpected Error'
            }
            );
        });
};

// Update a event by the id
exports.update = (req, res) => {
    if (!req.body) {
        return res.status(400).send({
            message: "Data to update event cannot be empty."
        });
    }

    const id = req.param.id;

    Event.findByIdAndUpdate(id, req.body, { runValidators: true })
        .then(data => {
            if (!data) {
                res.status(404).send({
                    message: `Cannot find Event with id=${id}`
                });
            } else res.send({ message: "Event updated successfully." })
        })
        .catch(err => {
            res.status(500).send({
                message: `Error updating event with id=${id}`,
                error: err
            });
        });
};

// Delete a post by the id
exports.delete = (req, res) => {
    const id = req.params.id;

    Event.findOneAndDelete(id)
    .then(data => {
        if (!data) {
            return res.status(404).send({
                message: `Cannot find event with id=${id}`,
                data: data
            });
        } else {
            return res.send({
                message: "Event deleted successfully."
            });
        }
    })
    .catch(err => {
        return res.status(500).send({
            message: `Error deleting event with id=${id}`,
            error: err.message || `Unexpected Error`
        })
    })
};