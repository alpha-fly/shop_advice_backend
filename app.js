require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs'); // multer 때문에. 파일시스템 접근.

mongoose
    .connect(process.env.MONGODB, {
        dbName: 'shop_advice',
        ignoreUndefined: true,
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .catch((err) => {
        console.error(err);
    });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const app = express();
const port = 3000;

const articleRouter = require('./routes/articles');
const userRouter = require('./routes/user');
const imageRouter = require('./routes/image'); // multer 사용하여 파일 업로드하는 기능 관련

const requestMiddleware = (req, res, next) => {
    // ** app.use (미들웨어)의 순서 중요!!
    console.log('Request URL:', req.originalUrl, ' - ', new Date());
    next();
};

app.use(express.static('static'));
app.use(express.json()); //JSON 데이터 parsing middleware
app.use(express.urlencoded());
app.use(requestMiddleware); // 콘솔에 request 들어오면 url이랑 날짜 찍어주는.


app.use(cors({
    origin: 'http://118.217.75.17:3000', // 출처 허용 옵션, 아스테리스크로 놓지 말고 frontend 출처로 변경할 것!
    credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
}));

app.use('/api/article', [articleRouter]);
app.use('/api/user', [userRouter]);
app.use('/api/image', [imageRouter]); // multer 사용하여 파일 업로드하는 기능 관련 
app.use('/upload', express.static('uploads'));


app.get('/', (req, res) => {
    //여기가 Router. 미들웨어와 유사하게 생김 (일종의 미들웨어다)request와 response
    res.send('hello world');
});

app.listen(port, () => {
    const dir = "./uploadedFiles"; // multer 폴더 이름 지정
    if (!fs.existsSync(dir)) fs.mkdirSync(dir); // multer 폴더 생성
    console.log(port, '포트로 서버가 켜졌어요!');
});
