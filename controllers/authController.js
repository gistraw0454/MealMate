const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require(process.cwd() + '/models');

// 회원가입 처리
exports.join = async (req, res, next) => {
    const { username, password, email } = req.body;

    // 요청 본문 디버깅
    console.log('요청 데이터:', req.body);

    if (!username || !password || !email) {
        console.error('필수 데이터 누락:', { username, password, email });
        return res.status(400).send('필수 데이터가 누락되었습니다.');
    }

    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE username = ?', [username]);
        if (rows.length > 0) {
            return res.redirect('/auth/join?error=exist');
        }

        const hash = await bcrypt.hash(password, 12);
        await db.execute('INSERT INTO users (username, password, email) VALUES (?, ?, ?)', [
            username,
            hash,
            email,
        ]);

        res.redirect('/auth/login');
    } catch (err) {
        console.error('회원가입 처리 중 에러:', err);
        next(err);
    }
};

// 로그인 처리
exports.login = (req, res, next) => {
    passport.authenticate('local', (authErr, user, info) => {
        if (authErr) {
            console.error(authErr);
            return next(authErr);
        }
        if (!user) {
            return res.redirect(`/?loginError=${info.message}`);
        }
        return req.login(user, (loginErr) => {
            if (loginErr) {
                console.error(loginErr);
                return next(loginErr);
            }
            return res.redirect('/group-search');
        });
    })(req, res, next);
};

// 로그아웃 처리
exports.logout = (req, res) => {
    req.logout(() => {
        res.redirect('/');
    });
};
