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

router.post('/authorized-reset', userController.resetPasswordLoggedIn);

router.post('/username', userController.updateUsername);

router.post('/displayname', userController.updateDisplayName);

router.patch('/logout', userController.logout);

router.get('/:id/posts/', userController.findAllPosts);

router.post('/:id/biography', userController.setBiography)

router.post('/:id/status', userController.setStatus)

router.post('/:id/image', userController.setImage)

router.delete('/account', userController.delete);

router.post('/follow', userController.followUser);

router.post('/unfollow', userController.unfollowUser);

router.post('/search', userController.searchUsers);

router.post('/block', userController.toggleBlockUser);

router.get('/block-status/:id', userController.checkBlockStatus);

router.get('/notifications/opt-in/:id', userController.getNotificationOptInStatus);

router.post('/notifications/opt-in', userController.updateNotificationOptIn);

router.get('/notifications', userController.getNotifications);

router.patch('/notifications/mark-read', userController.markAllNotificationsAsRead);

router.get('/:id', userController.findOne); // make sure this is always last

module.exports = router;