const express = require('express');
const authMiddleware = require("../middlewares/auth-middleware");
const Articles = require('../models/articles');


const router = express.Router();



//전체 게시글 조회

router.get('/',async(req,res) => {
    const allArticles = await Articles.find().sort({'date':-1});

    res.json({
        allArticles,
    });
});


//게시글 상세 조회
router.get('/:articleId',async(req,res) => {
    const {articleId} = req.params;

    const [articles] = await Articles.find({articleId:Number(articleId)})
    res.json({
       articles,
    });
});


//게시글 작성
router.post('/',authMiddleware, async(req,res) => {
    const {nickname} = res.locals.user;
    const {title,content,price,shopUrl,imageUrl,date} = req.body;

    
    if(!title||!content){
        res.status(400).send({
            errormessage: '제목과 내용을 작성해주세요.',
        })
    }

    await Articles.create({
        title,
        nickname,
        content,
        price,
        shopUrl,
        imageUrl,
        date,
        });

        res.status(201).send({message:'게시글이 작성되었습니다.'});
});




//게시글 수정
router.put('/:articleId',authMiddleware ,async(req,res) => {
    const {articleId} = req.params;
    const {title,content,price,shopUrl,imageUrl} = req.body;

    const existArticles = await Articles.find({
        articleId:Number(articleId),
    });

    if(!existArticles.length){res.status(400).send({
        errormessage: '사용자가 입력한 게시글이 아닙니다.',
    });
    }else{

    await Articles.updateOne({
        articleId:Number(articleId)
    },
    {$set:{title,content,price,shopUrl,imageUrl}});
    res.status(200).send({
        message: '수정이 완료되었습니다.',
    });
};
});

//게시글 삭제
router.delete('/:articleId',authMiddleware, async(req,res) => {
    const {userId} = res.locals.user;
    const {articleId} = req.params;

    const existArticles = await Articles.find({articleId:Number(articleId)});

    if(existArticles[0].userId === userId){
        await Articles.deleteOne({articleId:Number(articleId)});
        res.status(200).send({
            message: '삭제가 완료되었습니다.',
        });
    }else{
        return res.status(400).send({
            errormessage:'글 작성자가 아닙니다.',
        });
    };
});

module.exports = router;