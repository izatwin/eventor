const BaseEvent = require("../models/event");

// Retrieve an event by ID
exports.getEventById = async (req, res) => {
    try {
        const eventId = req.params.id;
        const event = await BaseEvent.findById(eventId);

        if (!event) {
            return res.status(404).send({
                message: "Event not found."
            });
        }

        res.status(200).send(event);
    } catch (err) {
        res.status(500).send({
            message: "Error retrieving event.",
            error: err.message
        });
    }
};

// Create a new event
exports.createEvent = async (req, res) => {
    try {
        const { eventType, ...eventData } = req.body;

        if (!eventType) {
            return res.status(400).send({
                message: "Event type is required."
            });
        }

        let event;
        if (eventType === 'NormalEvent') {
            event = new BaseEvent.discriminators.NormalEvent(eventData);
        } else if (eventType === 'MusicReleaseEvent') {
            event = new BaseEvent.discriminators.MusicReleaseEvent(eventData);
        } else if (eventType === 'TicketedEvent') {
            event = new BaseEvent.discriminators.TicketedEvent(eventData);
        } else {
            return res.status(400).send({
                message: "Invalid event type."
            });
        }

        await event.save();
        res.status(201).send(event);
    } catch (err) {
        res.status(500).send({
            message: "Error creating event.",
            error: err.message
        });
    }
};

// Edit an existing event
exports.editEvent = async (req, res) => {
    try {
        const eventId = req.params.id;
        const updates = req.body;

        const event = await BaseEvent.findByIdAndUpdate(eventId, updates, { new: true });
        if (!event) {
            return res.status(404).send({
                message: "Event not found."
            });
        }

        res.status(200).send(event);
    } catch (err) {
        res.status(500).send({
            message: "Error updating event.",
            error: err.message
        });
    }
};

// Delete an event
exports.deleteEvent = async (req, res) => {
    try {
        const eventId = req.params.id;

        const event = await BaseEvent.findByIdAndDelete(eventId);
        if (!event) {
            return res.status(404).send({
                message: "Event not found."
            });
        }

        res.status(200).send({
            message: "Event successfully deleted."
        });
    } catch (err) {
        res.status(500).send({
            message: "Error deleting event.",
            error: err.message
        });
    }
};