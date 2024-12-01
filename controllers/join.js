const bcrypt = require('bcrypt');
const passport = require('passport');
const db = require(process.cwd() + '/models');

exports.join = async (req, res, next) => {
    const {email, nickname, pw} = req.body;
    try {
        const [rows] = await db.execute('SELECT * FROM users WHERE email=?', [email]);
        if (rows.length > 0) {  //동일한 이름으로 가입한게 존재한다.
            return res.redirect('/join?error=exist');
        }
        const hash = await bcrypt.hash(pw, 12);   // 풀이유가 없기때문에 단방향 암호화 진행
        await db.execute('INSERT INTO users (email, nickname, pw) VALUES (?, ?, ?)', [email, nickname, hash]);
        return res.redirect('/');
    } catch (err) {
        console.error(err);
        return next(err);
    }
};