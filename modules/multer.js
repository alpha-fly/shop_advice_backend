const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

//AWS S3에 접근하기 위한 정보는 gitHub에 올라가지 않는 파일에 따로 은닉함.
aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region : 'ap-northeast-2'
})

// routes/images.js 에서 실행할 "upload" 함수를 multer를 이용해 만들어준다. 
// key 설정에서 파일을 업로드할 S3 버킷 내의 폴더 경로를 지정하고, 파일명 앞에 생성시점을 붙여 고유성을 확보한다. 
const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'hh99-6th',
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `shop_adv/${Date.now()}_${file.originalname}`);
    },
  }),
  limits: { fileSize: 1.5 * 1024 * 1024}
  // 파일 용량 제한 기준: AWS S3 free tier 
  // "5GB storage / 2,000번의 POST 요청" 기준으로 5GB/2000 = 2.56MB. 이보다 조금 보수적으로 잡아 1.5MB. 
});

module.exports = upload;