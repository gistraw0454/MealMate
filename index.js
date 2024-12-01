const express = require('express');
const cookieParser = require('cookie-parser');  //HTML 요청의 cookie를 해석해 req 객체에 추가
const morgan = require('morgan');   // HTTP 요청 로그를 기록하는 미들웨어
const path = require('path');   // 파일 및 디렉토리 경로를 다룸
const session = require('express-session'); // session 관리 미들웨어
const nunjucks = require('nunjucks');   // 템플릿 엔진, HTML파일에서 변수와 로직을 활용할 수 있게 해줌
const dotenv = require('dotenv');   // .env에 정의된 환경변수 로드
const passport = require('passport');   // 사용자 인증 간단히 처리할 수 있게 해주는 라이브러리

dotenv.config();    // .env에 있는 환경 변수를 process.env로 로드

const db = require('./models'); // 데이터베이스 모델 정의 파일 불러오기

// 라우터 불러오기
// ex) const pageRouter = require('./routes/page');
const homeRouter = require('./routes/login');





const passportConfig = require('./passport');   // Passport 설정 파일을 불러옵니다.

const app = express();  // express 애플리케이션 객체 생성
passportConfig();   // passport 설정 초기화

app.set('port', process.env.PORT);  // 포트 설정

app.set('view engine', 'html'); // 뷰 엔진을 html로 설정하고, views 폴더를 템플릿 파일 경로로 지정
nunjucks.configure('views', {
    express: app,
    watch: true,    // 템플릿 파일이 수정될 때 자동으로 반영
});

app.use(morgan('dev')); // 개발환경에서 HTTP 요청 로그 출력
app.use(express.static(path.join(__dirname, 'public')));    // public 디렉토리를 기본경로로 설정

app.use(express.json());    // json 형식의 요청 본문을 파싱
app.use(express.urlencoded({ extended: false }));   // URL-encoded 형식의 요청 본문을 파싱
app.use(cookieParser(process.env.COOKIE_SECRET));   // cookie 파싱
app.use(session({   // 세션
    resave: false,  // 세션 데이터가 바뀌지 않아도 저장X
    saveUninitialized: false,   // 초기화 되지않은 세션 저장X
    secret: process.env.COOKIE_SECRET,  // 세션 암호화에 사용할 키
    cookie: {
        httpOnly: true, // 클라이언트 스크립트에서 쿠키 접근 차단
        secure: false,  // HTTPS에서만 쿠키 전송X
    },
}));
app.use(passport.initialize()); // passport 초기화
app.use(passport.session());    // 세션을 passport와 연결

// 라우터 등록
// ex) app.use('/', pageRouter);
app.use('/', homeRouter);






// 에러처리
app.use((req, res, next) => {
    const err = new Error(`${req.method} ${req.url} 라우터가 없습니다.`);
    err.status = 404;
    next(err);
});
app.use((err, req, res, next) => {
    res.toLocaleString.message = err.statusMessage; // 에러메세지
    res.toLocaleString.error = process.env.NODE_ENV !== 'production' ? err : {};
    res.status(err.status || 500);
    res.render('error');
});

// 서버 실행
app.listen(app.get('port'), () => {
    console.log(`${app.get('port')}번 포트에서 대기 중`);
});