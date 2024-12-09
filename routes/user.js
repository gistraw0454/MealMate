const express = require('express');
const { isLoggedIn } = require('../middlewares');
const router = express.Router();

// 내 정보 보기
router.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile', { title: '내 프로필 - 밥머먹꼬', user: req.user });
});

module.exports = router;
