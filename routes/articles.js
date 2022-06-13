const express = require('express');
const authMiddleware = require("../middlewares/auth-middleware");
const Articles = require('../models/articles');
const user = require('../models/user');

const multer = require("multer");
const path = require("path");



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

    const [articles] = await Articles.find({id:articleId})
    res.json({
       articles,
    });
});


//게시글 작성
router.post('/',upload.single("image"),authMiddleware, async(req,res) => {
    const {userId} = res.locals.user;
    const writeId = await user.findOne({id:userId}).exec();
    const {title,content,price,shopUrl,imageUrl,date} = req.body;

    const image = `/images/${req.file.filename}`; //이미지
    
    
    if(!title||!content){
        res.status(400).send({
            errormessage: '제목과 내용을 작성해주세요.',
        });
    }

     const createdArticles = await Articles.create({
        title,
        user:writeId.user,
        content,
        image,
        price,
        shopUrl,
        imageUrl,
        date,
        });

        res.status(201).send({articles: createdArticles,message:'게시글이 작성되었습니다.'});
});




//게시글 수정
router.put('/:articleId',authMiddleware ,async(req,res) => {
    const {articleId} = req.params;
    const {title,content,price,shopUrl,imageUrl} = req.body;

    const existArticles = await Articles.find({
        id: articleId,
    });


    if(!existArticles.length){
        res.status(400).send({ errormessage: "게시글 작성자가 아닙니다." })
    }else{
        await Articles.updateOne({ id: articleId }, { $set: { title, content,price,shopUrl,imageUrl } });
        res.status(200).send({ message: "수정이 완료되었습니다." });
    }
});

//게시글 삭제
router.delete('/:articleId',authMiddleware, async(req,res) => {
    
    const {articleId} = req.params;

    const existArticles = await Articles.find({id:articleId});

    if(!existArticles.length){
        res.status(400).json({ errormassege: "게시글 작성자가 아닙니다." })
    }else{
        await Articles.deleteOne({ id: articleId });
        res.status(200).json({ message: "게시글을 삭제하였습니다." });
    }
});


//좋아요 (초안! 테스트 전)
router.post("/api/article/like/${articleId}", authMiddleware, async (req, res) => {
    const { user } = res.locals;    
    const { articleId } = req.params;   
    // const article = Article.findOne({articleId:article.articleId}) 
    // console.log (article)

    let UserLikesArray = user.likes;
    // console.log ("UserCurrentLikes :", UserLikesArray, "articleId :", articleId)
    
    if (UserLikesArray.includes(articleId)) {               
        const likes = UserLikesArray.filter(item => item !== articleId);
        await User.updateOne(
            { userId: user.userId },
            { $set: { likes } }
        );

        const articleLikes = Article.fineOne({articleId})[likes] - 1
        await Article.updateOne(
            { articleId },
            { $set: { likes: articleLikes }}
        )

        // console.log ("UserCurrentLikes :", UserLikesArray, "articleId :", articleId)
        res.status(200).send({ message: "사세요! 해제하셨습니다."});
    } else {
        UserLikesArray.push(articleId);
        // const likes = UserLikesArray
        await User.updateOne(
            { userId: user.userId },
            { $set: { likes : UserLikesArray } }
        );

        const articleLikes = Article.fineOne({articleId})[likes] + 1
        await Article.updateOne(
            { articleId },
            { $set: { likes: articleLikes }}
        );
        // console.log ("UserCurrentLikes :", UserLikesArray, "articleId :", articleId)
        res.status(200).send({ message: "사세요! 하셨습니다."});
    }        
  });
  
//좋아요 갯수 알려주기 (초안! 테스트 이전) ** 비로그인 기능임. 단순히 조회
router.get("/api/article/like/${articleId}", async (req, res) => {    
    const { articleId } = req.params;    
    const article = await Articles.find({ articleId });
    const likes = article["likes"];

    res.json({
        likes,
    })
});
   


module.exports = router;