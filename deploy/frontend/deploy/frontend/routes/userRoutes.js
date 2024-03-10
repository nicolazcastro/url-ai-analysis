const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../src/middelwares/authMiddleware');
const authService = require('../src/services/authService');

// Rutas relacionadas con los usuarios
router.post('/register', authService.registerUser); // Delega el registro al microservicio de usuarios
router.post('/login', authService.loginUser); // Delega el login al microservicio de usuarios
router.get('/result', authMiddleware, authService.getResult); // Obtiene resultados a través del microservicio de usuarios
router.post('/credit', authMiddleware, authService.updateCredit); // Actualiza créditos a través del microservicio de usuarios
router.get('/credit/:userId', authMiddleware, authService.getCredit); // Obtiene créditos a través del microservicio de usuarios

// Google Sign-In routes
router.get('/auth/google', authService.googleLoginRedirect); // Redirige al microservicio de usuarios para iniciar sesión con Google
router.get('/auth/google/callback', authService.googleLoginCallback); // Callback de inicio de sesión con Google

module.exports = router;
