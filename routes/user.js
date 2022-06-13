require("dotenv").config();
const express = require("express");
const crypto = require("crypto"); // crypto 사용
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const authMiddleware = require("../middlewares/auth-middleware");
const router = express.Router();


const postUsersSchema = Joi.object({
  // userId: 3~10글자, 알파벳 대소문자, 숫자 가능
  userId: Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,10}$")).required(),
  // nickname: 3~10글자, 알파벳 대소문자, 숫자, 한글 가능
  nickname: Joi.string()
    .pattern(new RegExp("^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{3,10}$"))
    .required(),
  password: Joi.string().min(4).max(16).required(),
  passwordCheck: Joi.string().min(4).max(16).required(),
});

// 회원가입
router.post("/signup", async (req, res) => {
  try {
    const { userId, nickname, password, passwordCheck } =
      await postUsersSchema.validateAsync(req.body);

    if (password !== passwordCheck) {
      res.status(400).send({
        errorMessage: "패스워드가 패스워드 확인란과 동일하지 않습니다.",
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
        crypto.pbkdf2(password, salt, 9999, 64, "sha512", (err, key) => {
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
    }); //salt 추가
    await user.save();

    res.status(201).send({ message: "회원가입을 축하합니다."});
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "요청한 데이터 형식이 올바르지 않습니다.",
    });
  }
});

//로그인
const postAuthSchema = Joi.object({
  userId: Joi.string().min(4).max(16).required(),
  password: Joi.string().required(),
});

router.post("/login", async (req, res) => {
  try {
    const { userId, password } = await postAuthSchema.validateAsync(req.body); // validation 전에는 일단 raw password

    //raw password를 회원가입시와 동일한 로직으로 암호화한다. 이때 회원가입시 함께 저장해둔 salt를 가져와서 사용.        
    const makePasswordHashed = (userId, password) =>
      new Promise(async (resolve, reject) => {
        
        const userFinder = await User.findOne({userId : userId})
        const salt = userFinder.salt;
                       
        crypto.pbkdf2(password, salt, 9999, 64, "sha512", (err, key) => {
          if (err) reject(err);
          resolve(key.toString("base64"));
        });
      });
    const crypt_password = await makePasswordHashed(userId, password);

    const user = await User.findOne({ userId, password:crypt_password }).exec();     

    if (!user) {
      res.status(400).send({
        errorMessage: "아이디 또는 패스워드를 확인해주세요.",
      });
      return;
    }    

    const token = jwt.sign(
      { userId: user.userId }, 
      process.env.JWT_SECRET_KEY,
      {expiresIn : "20m"}  
        
    );
    res.send({
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(400).send({
      errorMessage: "아이디 또는 패스워드를 확인해주세요.",
    });
  }
});

// 유저정보조회 (토큰 조회. 로그인 여부 확인)
router.get("/me", authMiddleware, async (req, res) => {
  const { user } = res.locals;
  res.send({
    user,
  });
});

module.exports = router;