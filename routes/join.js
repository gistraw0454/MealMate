const express = require('express');
const { isNotLoggedIn } = require('../middlewares');
const { join } = require('../controllers/join');

const router = express.Router();

// POST /auth/join
router.post('/join', isNotLoggedIn, join);

module.exports = router;