// app.js
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');
const passport = require('passport');

dotenv.config(); // 환경변수 설정 파일 로드
const db = require('./models'); // 데이터베이스 모델
const passportConfig = require('./passport'); // Passport 설정

const pageRouter = require('./routes/page'); // 메인, 그룹 찾기, 내 그룹 페이지
const authRouter = require('./routes/auth'); // 로그인, 회원가입, 로그아웃
const groupRouter = require('./routes/group'); // 그룹 생성, 삭제, 나가기 등
const userRouter = require('./routes/user'); // 사용자 관련 라우팅

const app = express();
passportConfig(); // Passport 초기화

// 포트 설정
app.set('port', process.env.PORT || 8090);

// Nunjucks 템플릿 엔진 설정
app.set('view engine', 'html');
nunjucks.configure('views', {
    express: app,
    watch: true,
});

// 미들웨어
app.use(morgan('dev')); // 개발환경 로그 출력
app.use(express.static(path.join(__dirname, 'public'))); // 정적 파일 제공
app.use(express.json()); // JSON 요청 처리
app.use(express.urlencoded({ extended: true })); // URL-encoded 요청 처리
app.use(cookieParser(process.env.COOKIE_SECRET)); // 쿠키 파싱
app.use(session({
    resave: false, // 세션 데이터가 변경되지 않으면 저장 안 함
    saveUninitialized: false, // 초기화되지 않은 세션 저장 안 함
    secret: process.env.COOKIE_SECRET, // 세션 암호화 키
    cookie: {
        httpOnly: true, // 클라이언트 스크립트에서 쿠키 접근 금지
        secure: false, // HTTPS에서만 쿠키 전송 (개발용 false)
    },
}));
app.use(passport.initialize()); // Passport 초기화
app.use(passport.session()); // 세션에 Passport 정보 저장

// 라우터 연결
app.use('/', pageRouter);
app.use('/auth', authRouter);
app.use('/group', groupRouter);
app.use('/user', userRouter);

// 에러 처리
app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    error.status = 404;
    console.error(error);
    // next(error);
});
//
// app.use((err, req, res, next) => {
//     res.locals.message = err.message;
//     res.locals.error = process.env.NODE_ENV !== 'production' ? err : {};
//     res.status(err.status || 500);
//     res.render('error');
// });
//


// 서버 실행
app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 대기 중`);
});
