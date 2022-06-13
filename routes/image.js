const express = require('express');
const multer = require("multer"); // multer 가져오기
const router = express.Router();
// const authMiddleware = require("../middlewares/auth-middleware");
// const Articles = require('../models/articles');
// const user = require('../models/user');
// const path = require("path");


// multer를 이용하여 업로드한 파일을 저장할 경로 및 파일명 설정함
const storage  = multer.diskStorage({ 
  destination(req, file, cb) {
    cb(null, 'uploadedFiles/');
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}__${file.originalname}`);
  },
});

// 위 storage 변수에 정의된 destination, filename을 따라서 이미지 파일을 저장하는 "미들웨어", 이것으로 업로드하면 파일 이름이 유지됨(단 유일성 보장을 위해 파일명 앞에 날짜를 붙임) 
const uploadWithOriginalFilename = multer({ storage: storage }); 

// 아래 get 요청은 쓸모가 없어보임. 테스트시 불필요하다면 삭제
router.get('/', function(req,res){
  res.render('upload');
});

// "/api/image/upload" 주소로 요청하면 uploadWithOriginalFilename 미들웨어가 실행되어 지정한 경로에 이미지가 저장되고,
// req.file에 `attachment` 즉 지금 저장한 파일의 정보를 주는데, 이것을 "fileInfo"에 담아서 리턴해준다.
router.post('/upload', uploadWithOriginalFilename.single('attachment'), function(req,res){ 
  console.log (req.file) // 테스트하며 req.file의 내용을 보고 필요한 부분만 가공한 다음에 아래 res.json 내용을 바꿔줄 예정이다.
  res.json( {fileInfo: req.file} );  
});

module.exports = router;