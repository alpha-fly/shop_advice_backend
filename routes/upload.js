const express = require('express');
const multer = require("multer");

const router = express.Router();
const image = require('../models/image')

//저장할 경로,uploads폴더 생성해 둘것
const Storage = multer.diskStorage({
    destination:'uploads',
    filename:(req,file,cb) => {
    cb(null,file.originalname);
    },
})
//storage 어디에 저장할 것인지
const upload = multer({
    storage:Storage
}).single('image')

router.get('/',(req,res) => {
    res.send('upload file');
});

//파일업로드
router.post('/upload', (req,res) =>{
    upload(req,res,(err) => {
        if(err){
            console.log(err)
        }else{
        const newImage = new image({
            
            image:{
                data:req.file.filename,
                contentType:'image/png'
            }
        })
        //데이터베이스 저장
        newImage.save()
        .then(() => res
        .send('사진업로드 완료'))
        .catch(err => console.log(err))
    }
    })
})

module.exports = router;