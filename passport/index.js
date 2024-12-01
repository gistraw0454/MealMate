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
            const [rows] = await db.execute('SELECT id, nickname FROM users WHERE id=?', [id]);
            if (rows.length > 0) {
                const user = rows[0];
                // const [followings] = await db.execute('SELECT u.id, u.nick FROM users u, follow f WHERE f.followerId=? AND u.id=f.followingId', [user.id]);
                // const [followers] = await db.execute('SELECT u.id, u.nick FROM users u, follow f WHERE f.followingId=? AND u.id=f.followerId', [user.id]);
                // user.followings = followings;
                // user.followers = followers;
                done(null, user);
            } else done(null);
        } catch (err) {
            console.error(err);
            done(err);
        }
    });

    local();
}