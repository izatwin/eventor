const BaseEvent = require("../models/event");
const User = require("../models/user")
const Post = require("../models/post");

// Common function to authenticate the user
async function authenticateUser(req) {
    let authenticatedUser = null;
    let authenticated = false;
    const req_cookies = req.cookies;

    if (req_cookies) {
        const user_id = req_cookies.user_id;
        if (user_id) {
            authenticatedUser = await User.findById(user_id);
            if (authenticatedUser) {
                const auth_token = req_cookies.auth_token;
                if (auth_token) {
                    const userCredentials = authenticatedUser.userCredentials;
                    if (userCredentials.matchAuthToken(auth_token)) {
                        authenticated = true;
                    }
                }
            }
        }
    }

    return authenticated ? authenticatedUser : null;
}

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
        const authenticatedUser = await authenticateUser(req);
        if (!authenticatedUser) {
            return res.status(400).send({
                message: "Not logged in!"
            });
        }

        const { eventType, postId, eventData } = req.body;

        // Check for event type
        if (!eventType) {
            return res.status(400).send({
                message: "Event type is required."
            });
        }

        // Check for post existence and event attachment
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({
                message: "Post not found."
            });
        }

        if (post.is_event) {
            return res.status(400).send({
                message: "An event is already attached to this post."
            });
        }

        let event;
        if (eventType === 'NormalEvent') {
            event = new BaseEvent.discriminators.NormalEvent({ ...eventData, post: postId });
        } else if (eventType === 'MusicReleaseEvent') {
            event = new BaseEvent.discriminators.MusicReleaseEvent({ ...eventData, post: postId });
        } else if (eventType === 'TicketedEvent') {
            event = new BaseEvent.discriminators.TicketedEvent({ ...eventData, post: postId });
        } else {
            return res.status(400).send({
                message: "Invalid event type."
            });
        }

        await event.save();
        post.is_event = true;
        post.eventId = event._id;
        await post.save();

        res.send(event);
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
        const authenticatedUser = await authenticateUser(req);
        if (!authenticatedUser) {
            return res.status(400).send({
                message: "Not logged in!"
            });
        }

        const eventId = req.params.id;
        const updates = req.body.event;
        const postId = req.body.postId;

        const event = await BaseEvent.findById(eventId);
        if (!event) {
            return res.status(404).send({
                message: "Event not found."
            });
        }

        const post = await Post.findById(postId);
        if (post.user.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).send({
                message: "You are not allowed to edit someone else's event."
            });
        }

        // Object.assign(event, updates);
        const updatedEvent = await BaseEvent.findByIdAndUpdate(eventId, updates, { runValidators: true, new: true });

        res.status(200).send(updatedEvent);
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
        const authenticatedUser = await authenticateUser(req);
        if (!authenticatedUser) {
            return res.status(400).send({
                message: "Not logged in!"
            });
        }

        const eventId = req.params.id;
        const postId = req.body.postId;
        const event = await BaseEvent.findById(eventId);

        if (!event) {
            return res.status(404).send({
                message: "Event not found."
            });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).send({
                message: "Post not found."
            });
        }
        if (post.user.toString() !== authenticatedUser._id.toString()) {
            return res.status(403).send({
                message: "You are not allowed to delete someone else's event."
            });
        }

        post.is_event = false;
        post.eventId = null;
        await post.save();
        await BaseEvent.findByIdAndDelete(eventId);

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