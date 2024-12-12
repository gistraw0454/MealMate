const express = require('express');
const { renderGroupSearchPage, renderMyGroupsPage, renderMealLogPage } = require('../controllers/pageController');
const { isLoggedIn } = require('../middlewares');
const router = express.Router();

// 메인 페이지
router.get('/', (req, res) => {
    res.render('layout', { title: '밥머먹꼬', user: req.user });
});

// 그룹 찾기 페이지
router.get('/group-search', renderGroupSearchPage);

// 내 그룹 페이지
router.get('/my-groups', renderMyGroupsPage);

module.exports = router;
