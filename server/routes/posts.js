// server/routes/posts.js

const router = require('express').Router();
const postController = require('../controllers/post.controller')

// POST /api/posts - create a new post
router.post('/', postController.create);

router.get('/user/:id', postController.findAllPostsByUser);

router.get('/feed', postController.getFeed)

router.get('/:id', postController.findOne);

router.delete('/:id', postController.delete);

router.put('/:id', postController.update);

router.post('/toggle-like', postController.toggleLike);

router.post('/action', postController.viewOrSharePost);

router.post('/search', postController.searchPosts);

module.exports = router;