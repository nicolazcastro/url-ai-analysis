const express = require('express');
const router = express.Router();
const urlAnalysisController = require('../src/controllers/urlAnalysisController');
const userController = require('../src/controllers/userController');
const accountController = require('../src/controllers/accountController');
const { authMiddleware } = require('../src/middelwares/authMiddleware');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);

router.post('/analyze', authMiddleware, urlAnalysisController.analyzeUrl);
router.get('/result', authMiddleware, urlAnalysisController.getResult);
router.post('/credit', authMiddleware, accountController.updateCredit);
router.get('/credit/:userId', authMiddleware, accountController.getCredit);

module.exports = router;
