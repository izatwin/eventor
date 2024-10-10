// server/routes/users.js

const router = require('express').Router();
const userController = require('../controllers/user.controller')

// USER /api/user - create a new user
router.post('/', userController.signup);

// login and get user info
router.get('/login', userController.login);

module.exports = router;