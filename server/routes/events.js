// server/routes/posts.js

const router = require('express').Router();
const eventController = require('../controllers/event.controller')

// POST /api/posts - create a new post
router.post('/', eventController.create);

router.get('/:id', eventController.findOne);

router.delete('/:id', eventController.delete);

router.put('/:id', eventController.update);

module.exports = router;