require("dotenv").config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

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

// ** express를 켜준 뒤, app.use (미들웨어)의 순서는 중요하다. 잘 생각해서 배치하기.
const app = express();
const port = 3000;

const userRouter = require('./routes/users');
const articleRouter = require('./routes/articles');
const commentRouter = require('./routes/comments');
const imageRouter = require('./routes/images');

// CORS 사용을 위한 옵션 설정. 허용할 주소들을 배열로 정의해둔다.
// credentials: true 로 설정해둬야 인증에 관련된 요청들도 허용해줄 수 있다. 
const domains = ['http://shop-advice.s3-website.ap-northeast-2.amazonaws.com', "http://localhost:3000"];
const corsOptions = {
  origin: function(origin, callback){
  	const isTrue = domains.indexOf(origin) !== -1;
    callback(null, isTrue);
  }
  ,
  credentials: true
}

app.use(cors(corsOptions));

const requestMiddleware = (req, res, next) => {    
    console.log('Request URL:', req.originalUrl, ' - ', new Date());
    next();
};

app.use(express.static('static'));
app.use(express.json());
app.use(express.urlencoded());
app.use(requestMiddleware); 

app.use('/api/user', [userRouter]);
app.use('/api/article', [articleRouter]);
app.use('/api/comment', [commentRouter]);
app.use('/api/image',[imageRouter]);

app.get('/', (req, res) => {    
    res.send('hello world');
});

app.listen(port, () => {    
    console.log(port, '포트로 서버가 켜졌어요!');
});