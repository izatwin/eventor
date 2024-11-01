// server/routes/posts.js

const router = require('express').Router();
const eventController = require('../controllers/event.controller');

// Retrieve an event by ID
router.get('/:id', eventController.getEventById);

// Create a new event
router.post('/', eventController.createEvent);

// Edit an existing event
router.put('/:id', eventController.editEvent);

// Delete an event
router.post('/delete/:id', eventController.deleteEvent);

module.exports = router;