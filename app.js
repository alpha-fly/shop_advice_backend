const express = require('express');
const mongoose = require('mongoose');

mongoose
    .connect('mongodb://test:test@3.34.42.87:27017/admin', {
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

// const articleRouter = require('./routes/article');
const userRouter = require('./routes/user');

const requestMiddleware = (req, res, next) => {
    // ** app.use (미들웨어)의 순서 중요!!
    console.log('Request URL:', req.originalUrl, ' - ', new Date());
    next();
};

app.use(express.static('static'));
app.use(express.json()); //JSON 데이터 parsing middleware
app.use(express.urlencoded());
app.use(requestMiddleware); // 콘솔에 request 들어오면 url이랑 날짜 찍어주는.

// app.use('/api/article', [articleRouter]);
app.use('/api/user', [userRouter]);

app.get('/', (req, res) => {
    //여기가 Router. 미들웨어와 유사하게 생김 (일종의 미들웨어다)request와 response
    res.send('hello world');
});

app.listen(port, () => {
    console.log(port, '포트로 서버가 켜졌어요!');
});
