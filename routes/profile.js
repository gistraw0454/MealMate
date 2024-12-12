const express = require('express');
const { isLoggedIn } = require('../middlewares');
const { renderProfilePage, updateProfile } = require('../controllers/profileController');

const router = express.Router();

// 프로필 페이지 렌더링
router.get('/', isLoggedIn, renderProfilePage);

// 프로필 수정
router.post('/update', isLoggedIn, updateProfile);

module.exports = router;
