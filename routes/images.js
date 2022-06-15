const express = require("express");
const router = express.Router();
const Images = require("../models/image");
const upload = require("../modules/multer");

router.post("/", upload.single("image"), async (req, res) => {
  // modules/multer.js에 정의된 upload를 실행하여, 1개의 이미지 파일을 S3 버킷에 업로드한다.
  // 업로드시 multer가 작성해주는 req.file의 정보에서, 이미지 파일의 url주소를 담은 "location" 값을 가져와서 리턴해준다.
  // Images 모델로, DB에 사진 주소와 생성시점을 기록하고 있다. 
  console.log(req.file);
  const imageUrl = req.file.location;
  const createdAt = new Date();

  await Images.create({
    imageUrl,
    createdAt,
  });

  res.status(200).json({ imageUrl });
});

module.exports = router;
