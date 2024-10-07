// server/routes/comment.js

const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');

// Post /api/comment - create a new comment
router.post('/', commentController.create);

module.exports = router