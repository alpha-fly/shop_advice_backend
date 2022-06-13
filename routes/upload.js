const express = require('express');
const router = express.Router();
const multer = require("multer");

// 1. multer 미들웨어 등록
let upload = multer({
    dest: "upload/"
})

// 뷰 페이지 경로 
router.get('/show', function(req, res, next) {
    res.render("board")
});

// 2. 파일 업로드 처리
router.post('/create', upload.single("imgFile"), function(req, res, next) {
    // 3. 파일 객체
    let file = req.file

    // 4. 파일 정보
    let result = {
        originalName : file.originalname,
        size : file.size,
    }

    res.json(result);
});

module.exports = router;