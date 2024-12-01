const express = require('express');
const { isLoggedIn, isNotLoggedIn } = require('../middlewares');
const { login, logout } = require('../controllers/login');

const router = express.Router();

// POST /auth/login
router.post('/login', isNotLoggedIn, login);

// GET /auth/logout
router.get('/logout', isLoggedIn, logout);

module.exports = router;