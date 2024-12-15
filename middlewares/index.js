//middlewares/index.js
exports.isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {    // isAuthenticated == 1이면 next()
        next();
    } else {    // isAuthenticated == 0 로그인 X
        return res.redirect(`/?error=not_logged_in`);   // 미들웨어 끝
    }
};

exports.isNotLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        next();
    } else {
        const message = encodeURIComponent('로그인한 상태입니다.');
        res.redirect(`/?error=${message}`);
    }
};
