require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs'); // multer 때문에. 파일시스템 접근.

const domains = ['http://shop-advice.s3-website.ap-northeast-2.amazonaws.com'];
const corsOptions = {
  origin: function(origin, callback){
  	const isTrue = domains.indexOf(origin) !== -1;
    callback(null, isTrue);
  }
  ,
  credentials: true
}

app.use(cors(corsOptions));

// app.use(cors({
//     origin: 'http://shop-advice.s3-website.ap-northeast-2.amazonaws.com/', // 출처 허용 옵션, 아스테리스크로 놓지 말고 frontend 출처로 변경할 것!
//     credential: 'true' // 사용자 인증이 필요한 리소스(쿠키 ..등) 접근
// }));

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

const userRouter = require('./routes/user');
const articleRouter = require('./routes/articles');
const commentRouter = require('./routes/comment');
const imageRouter = require('./routes/image');

const requestMiddleware = (req, res, next) => {
    // ** app.use (미들웨어)의 순서 중요!!
    console.log('Request URL:', req.originalUrl, ' - ', new Date());
    next();
};

app.use(express.static('static'));
app.use(express.json()); //JSON 데이터 parsing middleware
app.use(express.urlencoded());
app.use(requestMiddleware); // 콘솔에 request 들어오면 url이랑 날짜 찍어주는.

app.use('/api/user', [userRouter]);
app.use('/api/article', [articleRouter]);
app.use('/api/comment', [commentRouter]);
app.use('/api/image',[imageRouter]);

app.get('/', (req, res) => {
    //여기가 Router. 미들웨어와 유사하게 생김 (일종의 미들웨어다)request와 response
    res.send('hello world');
});

app.listen(port, () => {    
    console.log(port, '포트로 서버가 켜졌어요!');
});