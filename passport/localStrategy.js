// passport/localStrategy.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require(process.cwd() + '/models');

module.exports = () => {
    passport.use(new LocalStrategy({    // 로그인시 username, pw를 입력하여 인증
        usernameField: 'username',  // req.body의 내가 준 속성명을 적어준다. -> req.body.username을 가져온다.
        passwordField: 'password',
        passReqToCallback: false,   // req 객체를 콜백 함수로 전달하지 않겠다 설정
    }, async (username, password, done) => {
        try {
            const [rows] = await db.execute('SELECT * FROM users WHERE username=?', [username]);
            if (rows.length > 0) {  // 사용자가 DB에 존재하면
                const result = await bcrypt.compare(password, rows[0].password);  // 입력된 비번과 DB저장된 해시된 비번 비교
                if (result) {
                    done(null, rows[0]);    //일치하면 사용자 정보 반환하여 인증 완료(성공여부를 전달한다는 소리와 동일)
                } else {
                    done(null, false, {message: '비밀번호가 일치하지 않습니다.'});
                }
            } else {
                done(null, false, {message: '가입되지 않은 회원입니다.'});
            }
        } catch (err) {
            console.error(err);
            done(err);
        }
    }))
};