const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const urlAnalysisController = require('../src/controllers/urlAnalysisController');
const accountController = require('../src/controllers/accountController');
const { authMiddleware } = require('../src/middelwares/authMiddleware');
const authService = require('../src/services/authService');

// Existing routes
router.post('/user/register', userController.registerUser);
router.post('/user/login', userController.loginUser);
router.post('/user/verify-token', userController.verifyUserToken);
router.post('/user/refresh-token', userController.refreshUserToken);
router.post('/user/analyze', authMiddleware, urlAnalysisController.analyzeUrl);
router.get('/user/result', authMiddleware, urlAnalysisController.getResult);
router.post('/user/credit', authMiddleware, accountController.updateCredit);
router.get('/user/credit/:userId', authMiddleware, accountController.getCredit);

// Google Sign-In routes
router.get('/auth/google', authService.googleLoginRedirect);
router.get('/auth/google/callback', authService.googleLoginCallback);

module.exports = router;
