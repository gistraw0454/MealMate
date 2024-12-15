//controllers/authController.js
const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require(process.cwd() + '/models');

// 회원가입 처리
exports.join = async (req, res, next) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) {
        console.error('필수 데이터 누락:', { username, password, email });
        return res.status(400).send('필수 데이터가 누락되었습니다.');
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.redirect('/auth/join?error=exit');
        }
        const hash = await bcrypt.hash(password, 12);   // pw는 해싱하여 저장한다.
        await db.execute('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [
            username, hash, email,
        ]);
        res.redirect('/auth/login');    // 회원가입 이후 redirect
    } catch (err) {
        console.error('회원가입 처리 중 에러:', err);
        next(err);
    }
};

// 로그인 요청을 보내면
exports.login = (req, res, next) => {   // 미들웨어 수행
    //passport.authenticate('local', (authErr, user, info) => { } 이걸로 로그인 전략으로 이동한다.
    passport.authenticate('local', (authErr, user, info) => {   // localstartegy로 이동하여 user값을 리턴받는다.
        if (authErr) {  // 에러가 뜨면 에러 처리
            console.error(authErr);
            return next(authErr);
        }
        if (!user) {    // user가 없으면 유저없음 loginError와 함께 /로 리다이렉트
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginErr) => {
            if (loginErr) { // loginerr가 있으면 에러처리
                console.error(loginErr);
                return next(loginErr);
            }
            return res.redirect('/group-search'); // group-search로 리다이렉트
        });
    })(req, res, next);
};

// 로그아웃 처리
exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
};
