// server/routes/comment.js

const router = require('express').Router();
const commentController = require('../controllers/comment.controller');

// Post /api/comments - create a new comment
router.post('/', commentController.create);

router.get('/post/:postId', commentController.findCommentsOnPost)

router.post('/addChild/:id', commentController.addComment);

router.post('/toggle-like', commentController.toggleLike);

router.get('/:id', commentController.findOne);

router.delete('/:id', commentController.delete);

router.put("/:id", commentController.update);

module.exports = router