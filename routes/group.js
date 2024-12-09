const express = require('express');
const {
    createGroup,
    deleteGroup,
    recommendMenu,
    changeCategory,
    leaveGroup,
    excludeMenu,
} = require('../controllers/groupController');
const { isLoggedIn } = require('../middlewares');
const router = express.Router();

// 그룹 생성
router.post('/create', isLoggedIn, createGroup);

// 그룹 삭제
router.post('/delete/:groupId', isLoggedIn, deleteGroup);

// 메뉴 추천
router.post('/recommend/:groupId', isLoggedIn, recommendMenu);

// 분류 변경
router.post('/change-category/:groupId', isLoggedIn, changeCategory);


// 그룹 나가기
router.post('/leave/:groupId', isLoggedIn, leaveGroup);

// 메뉴 제외
router.post('/exclude/:groupId', isLoggedIn, excludeMenu);

module.exports = router;
