const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const accountController = require('../src/controllers/accountController');
const { authMiddleware } = require('../src/middelwares/authMiddleware');
const authService = require('../src/services/authService');

// Existing routes
router.post('/user/register', userController.registerUser);
router.post('/user/login', userController.loginUser);
router.post('/analyze', authMiddleware, urlAnalysisController.analyzeUrl);
router.post('/credit', authMiddleware, accountController.updateCredit);
router.get('/credit/:userId', authMiddleware, accountController.getCredit);

// Google Sign-In routes
router.get('/auth/google', authService.googleLoginRedirect);
router.get('/auth/google/callback', authService.googleLoginCallback);

module.exports = router;