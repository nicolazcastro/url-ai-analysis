const express = require('express');
const router = express.Router();
const userController = require('../src/controllers/userController');
const urlAnalysisController = require('../src/controllers/urlAnalysisController');
const accountController = require('../src/controllers/accountController');
const { authMiddleware } = require('../src/middelwares/authMiddleware');
const authService = require('../src/services/authService');

// Existing routes
router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.post('/analyze', authMiddleware, urlAnalysisController.analyzeUrl);
router.get('/result', authMiddleware, urlAnalysisController.getResult);
router.post('/credit', authMiddleware, accountController.updateCredit);
router.get('/credit/:userId', authMiddleware, accountController.getCredit);

// Google Sign-In routes
router.get('/auth/google', authService.googleLoginRedirect);
router.get('/auth/google/callback', authService.googleLoginCallback);

module.exports = router;
