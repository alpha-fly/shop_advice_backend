const express = require('express');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const authMiddleware = require('../middlewares/auth-middleware');
const router = express.Router();

const postUsersSchema = Joi.object({
    // userId: 3~10글자, 알파벳 대소문자, 숫자 가능
    userId: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9]{3,10}$'))
        .required(),
    // nickname: 3~10글자, 알파벳 대소문자, 숫자, 한글 가능
    nickname: Joi.string()
        .pattern(new RegExp('^[a-zA-Z0-9ㄱ-ㅎㅏ-ㅣ가-힣]{3,10}$'))      
        .required(),
    password: Joi.string().min(4).max(16).required(),
    passwordCheck: Joi.string().min(4).max(16).required(), 
});

// 회원가입
router.post('/signup', async (req, res) => {
    try {
        const { userId, nickname, password, passwordCheck } =
            await postUsersSchema.validateAsync(req.body);        

        if (password !== passwordCheck) {
            res.status(400).send({
                errorMessage: '패스워드가 패스워드 확인란과 동일하지 않습니다.',
            });
            return;
        }

        const dup_id = await User.find({
            $or: [{ userId }],
        });
        if (dup_id.length) {
            res.status(400).send({
                errorMessage: '중복된 아이디입니다.',
            });
            return;
        }

        const dup_nickname = await User.find({
            $or: [{ nickname }],
        });
        if (dup_nickname.length) {
            res.status(400).send({
                errorMessage: '중복된 닉네임입니다.',
            });
            return;
        }

        const user = new User({ userId, nickname, password });
        await user.save();

        res.status(201).send({});
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '요청한 데이터 형식이 올바르지 않습니다.',
        });
    }
});

//로그인
const postAuthSchema = Joi.object({
    userId: Joi.string().min(4).max(16).required(),
    password: Joi.string().required(),
});

router.post('/login', async (req, res) => {
    try {
        const { userId, password } = await postAuthSchema.validateAsync(req.body);

        const user = await User.findOne({ userId, password }).exec();
        console.log(user);

        if (!user) {
            res.status(400).send({
                errorMessage: '아이디 또는 패스워드를 확인해주세요.',
            });
            return;
        }

        const token = jwt.sign(
            { userId: user.userId },  //token 에 닉네임도 넣고 싶다면 여기에 추가하자. 
            'jaysecretkeyissocomplex'
        );
        res.send({
            token,
        });
    } catch (err) {
        console.log(err);
        res.status(400).send({
            errorMessage: '아이디 또는 패스워드를 확인해주세요.',
        });
    }
});

// 유저정보조회 (토큰 조회. 로그인 여부 확인)
router.get('/me', authMiddleware, async (req, res) => {
    const { user } = res.locals;
    res.send({
        user,
    });
});

module.exports = router;
