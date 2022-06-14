const express = require("express");
const multer = require("multer");
const router = express.Router();

const storage = multer.diskStorage({
  //어디에 저장할 것인가
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  //파일이름
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

router.get("/", (req, res) => {
  res.send("upload");
});

router.post("/upload", upload.single("image"), (req, res) => {  
  // 파일 상대경로(프로젝트 폴더 내의 경로)를 imagePath 변수에 저장합니다.
  const imagePath = req.file["path"]
  console.log(imagePath) 
  res.send("upload:" + req.file.filename); 
});

module.exports = router;
