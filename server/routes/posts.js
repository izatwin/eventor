// server/routes/posts.js

const router = require('express').Router();
const postController = require('../controllers/post.controller')

// POST /api/posts - create a new post
router.post('/', postController.create);

router.get('/', postController.findAll);

router.get('/:id', postController.findOne);

router.delete('/:id', postController.delete);

router.put('/:id', postController.update);

module.exports = router;