// routes/auth.js
const express = require('express');
const { isNotLoggedIn ,isLoggedIn} = require('../middlewares');
const { join, login, logout } = require('../controllers/authController');

const router = express.Router();

// GET /auth/login - 로그인 페이지 렌더링
router.get('/login', isNotLoggedIn, (req, res) => {
    const loginError = req.query.loginError || null;
    res.render('login', { title: '로그인 - 밥머물꼬', loginError });
});

// POST /auth/login - 로그인 처리
router.post('/login', isNotLoggedIn, login);

// GET /auth/join - 회원가입 페이지 렌더링
router.get('/join', isNotLoggedIn, (req, res) => {
    const error = req.query.error || null;
    res.render('join', { title: '회원가입 - 밥머물꼬', error });
});

// POST /auth/join - 회원가입 처리
router.post('/join', isNotLoggedIn, join);

// POST /auth/logout - 로그아웃 처리
router.get('/logout', isLoggedIn, logout);

module.exports = router;
