// passport/index.js
const passport = require('passport');
const local = require('./localStrategy');   // ./localStrategy에서 정의한 로컬 인증전략을 가져옴
const db = require(process.cwd() + '/models');

module.exports = () => {
    // 사용자가 로그인한 후, 사용자 정보를 세션에 저장하기 위해 호출됨
    passport.serializeUser((user, done) => {
        done(null, user.id);    // 에러없음 null, 세션에 저장할 데이터 user.id
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const [rows] = await db.execute('SELECT id,username FROM users WHERE id=?', [id]);
            if (!Array.isArray(rows)) {
                throw new Error('Unexpected database response'); // 예기치 않은 응답 처리
            }
            if (rows.length > 0) {  // 해당 id에 대한 사용자가 존재하면
                const user = rows[0];
                done(null, user);
            } else {
                done(null, false); // 사용자 없음 처리
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    });



    local();
}