// server/routes/users.js

const router = require('express').Router();
const userController = require('../controllers/user.controller')

// USER /api/user - create a new user
router.post('/signup', userController.signup);

router.post('/login', userController.login);

router.get('/validate', userController.isLoggedIn);

router.get('/:email/exists', userController.isValidAccountEmail);

router.post('/verify', userController.beginVerification);

router.patch('/verify', userController.verifyEmail);

router.post('/reset', userController.resetPassword);

router.patch('/logout', userController.logout);

router.get('/:id/posts/', userController.findAllPosts);

router.post('/:id/biography', userController.setBiography)

router.post('/:id/status', userController.setStatus)

router.post('/:id/image', userController.setImage)

module.exports = router;