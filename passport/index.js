// passport/index.js
const passport = require('passport');
const local = require('./localStrategy');   // ./localStrategy에서 정의한 로컬 인증전략을 가져옴
const db = require(process.cwd() + '/models');  // root경로/models/

module.exports = () => {
    // 사용자가 로그인에 성공한 후, 사용자 정보 객체를 세션에 아이디로 저장, 즉, 사용자정보객체 -> sessionID
    passport.serializeUser((user, done) => {    // user로 넘어오는 정보는 localStrategy 객체의 인증함수에서 done(null,user)에 의해 리턴된 값이 넘어온다.
        // 매개변수로 user을 받아 done 함수에 두번째 인자로 user.id를 넘긴다. 이렇게 id만 저장하면 세션 용량이커지는걸 막을 수 있다.
        done(null, user.id);    // 에러없음 null, 세션에 저장할 데이터 user.id
    });

    // passport.seesion() 미들웨어가 이 메서드를 호출한다.
    // 세션에 저장한 아이디를 통해 사용자 정보 객체를 불러온다. 즉, sessionID -> 사용자정보객체
    // node.js의 모든 페이지에 접근할때, 로그인이 되어 있을 경우 모든 페이지를 접근할 때 , deserilizeUser가 발생한다
    passport.deserializeUser(async (id, done) => {  // 여기서 인자로 넘어오는 id는 세션에 저장된 사용자 정보.
        try {
            const [rows] = await db.execute('SELECT id,username,email FROM users WHERE id=?', [id]);
            if (rows.length > 0) {  // 해당 id에 대한 사용자가 존재하면
                const user = rows[0];
                done(null, user);   // 조회한 정보를 HTTP Request 에 “req.user” 값으로 다른 페이지에 전달된다.
            } else {
                done(null, false); // 사용자 없음 처리
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    });
    local();    // local인증전략을 호출함.
}