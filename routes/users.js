require("dotenv").config();
const express = require("express");
const router = express.Router();
const crypto = require("crypto"); 
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middlewares/auth-middleware");


// <---회원가입 API-->
// frontend 요청으로 중복 ID, 중복 nickname 확인 API를 별도로 작성해서, 똑같은 코드가 반복되고 있음.
// 만일 frontend 화면에서 회원가입 버튼 클릭 이전에 중복확인 버튼 클릭이 강제된다면 내 코드를 삭제해도 되지만
// 그렇지 않다면 남겨둬야 한다.
// userId: 3~10글자, 알파벳 대소문자, 숫자 가능
// nickname: 3~10글자, 알파벳 대소문자, 숫자, 한글 가능
const postUsersSchema = Joi.object({
  userId: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,10}$")).required(),
  nickname: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{3,10}$"))
    .required(),
  password: Joi.string().min(4).max(16).required(),
  passwordCheck: Joi.string().min(4).max(16).required(),
});

router.post("/signup", async (req, res) => {
  try {
    const { userId, nickname, password, passwordCheck } =
      await postUsersSchema.validateAsync(req.body);

    if (password !== passwordCheck) {
      res.status(400).send({
        errorMessage: "패스워드가 불일치합니다.",
      });
      return;
    }

    const dup_id = await User.find({
      $or: [{ userId }],
    });
    if (dup_id.length) {
      res.status(400).send({
        errorMessage: "중복된 아이디입니다.",
      });
      return;
    }

    const dup_nickname = await User.find({
      $or: [{ nickname }],
    });
    if (dup_nickname.length) {
      res.status(400).send({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    }

    //이하는 비밀번호 암호화 과정.
    //Crypto 모듈의 randomBytes 메소드를 통해 Salt를 반환하는 함수를 작성한다.
    const createSalt = () =>
      new Promise((resolve, reject) => {
        crypto.randomBytes(64, (err, buf) => {
          if (err) reject(err);
          resolve(buf.toString("base64"));
        });
      });

    // 암호화가 안된 비밀번호를 인자로 받아 위에서 작성한 createSalt 함수로 salt를 생성하고 sha-512로 해싱한 암호화된 비밀번호가 생성된다.
    const createHashedPassword = (password) =>
      new Promise(async (resolve, reject) => {
        const salt = await createSalt();
        //인자 순서대로 : ( password, salt, iterations, keylen, digest, callback )
        crypto.pbkdf2(password, salt, 9999, 256, "sha512", (err, key) => {
          if (err) reject(err);
          resolve({ crypt_password: key.toString("base64"), salt });
        });
      });

    const { crypt_password, salt } = await createHashedPassword(
      req.body.password
    );

    const user = new User({
      userId,
      nickname,
      password: crypt_password,
      salt,
    }); 
    await user.save();

    res.status(201).json({ message: "회원가입을 축하합니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "회원가입 형식을 확인해주세요.",
    });
  }
});


// <---userId 중복확인 API-->
const postDupIdSchema = Joi.object({
  userId: Joi.string().min(3).max(10).required(),
});

router.post("/dup_userId", async (req, res) => {
  try {
    const { userId } = await postDupIdSchema.validateAsync(req.body);    

    const dup_userId = await User.find({
      $or: [{ userId }],
    });

    if (dup_userId.length) {
      res.status(400).json({
        errorMessage: "중복된 아이디입니다.",
      });
      return;
    } else {
      res.status(200).json({
        message: "사용 가능한 ID입니다.",
      });
    }

  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "회원가입 형식을 확인해주세요.",
    });
  }
});


// <---nickname 중복확인 API-->
const postDupNicknameSchema = Joi.object({  
  nickname: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{3,10}$"))
    .required(),
});

router.post("/dup_nickname", async (req, res) => {
  try {
    const { nickname } = await postDupNicknameSchema.validateAsync(req.body);
   
    const dup_nickname = await User.find({
      $or: [{ nickname }],
    });

    if (dup_nickname.length) {
      res.status(400).json({
        errorMessage: "중복된 닉네임입니다.",
      });
      return;
    } else {
      res.status(200).json({
        message: "사용 가능한 닉네임입니다.",
      });
    }
    
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "회원가입 형식을 확인해주세요.",
    });
  }
});


// <---로그인 API-->
const postAuthSchema = Joi.object({
  userId: Joi.string().min(3).max(10).required(),
  password: Joi.string().required(),
});

router.post("/login", async (req, res) => {
  try {
    //사용자가 입력하는 password는 암호화 이전의 값임. Joi로 validation 부터 검사. 
    const { userId, password } = await postAuthSchema.validateAsync(req.body); 
    const existUser = await User.findOne({ userId });

    if (!existUser) {
      res.status(400).json({
        errorMessage: "아이디 또는 패스워드를 확인해주세요.",
      });
      return;
    }

    //입력받은 password를 회원가입시와 동일한 로직으로 암호화한다. 
    //이때 회원가입시 함께 저장해둔 salt를 가져와서 사용.
    const makePasswordHashed = (userId, password) =>
      new Promise(async (resolve, reject) => {
        const userFinder = await User.findOne({ userId: userId });
        const salt = userFinder.salt;
      
        crypto.pbkdf2(password, salt, 9999, 256, "sha512", (err, key) => {
          if (err) reject(err);
          resolve(key.toString("base64"));
        });
      });
    const crypt_password = await makePasswordHashed(userId, password);

    const user = await User.findOne({
      userId,
      password: crypt_password,
    }).exec();

    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "120m" }
    );
    res.send({
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({
      errorMessage: "아이디 또는 패스워드를 확인해주세요.",
    });
  }
});


// <---유저정보조회(토큰 내용 확인) API-->
router.get("/me", authMiddleware, async (req, res) => {
  // res.locals에는 user DB로 관리되는 모든 값이 들어 있다. 
  // password, likes[] 등은 유저 확인에는 불필요하므로, userId와 nickname만 리턴한다. 
  const { user } = res.locals;
  const userInfo = { userId: user.userId, nickname: user.nickname };
  console.log(userInfo);
  res.send({
    userInfo,
  });
});

module.exports = router;
