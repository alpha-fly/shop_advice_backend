const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const Articles = require("../models/articles");
const Counters = require("../models/counters");


const router = express.Router();

//전체 게시글 조회

router.get("/", async (req, res) => {
  const articles = await Articles.find().sort({ date: -1 });

  res.json({
    articles,
  });
});

//게시글 상세 조회
router.get("/:articleId", async (req, res) => {
  const { articleId } = req.params;

  const [article] = await Articles.find({ articleId: articleId });
  res.json({
    article,
  });
});

//게시글 작성
router.post("/", authMiddleware, async (req, res) => {
  const nickname = res.locals.user.nickname;
  const { title, content, price, shopUrl, imageUrl, category } = req.body;

  let counter = await Counters.findOne({ name: "Articles" }).exec();
  if (!counter) {
    counter = await Counters.create({ name: "Articles", count: 0 });
  }
  counter.count++;
  counter.save();
  let articleId = counter.count;

  if (!title || !content|| !price || !shopUrl || !imageUrl ||!category) {
    res.status(400).send({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  }

  const createdArticles = await Articles.create({
    title,
    nickname,
    articleId,
    content,
    price,
    shopUrl,
    imageUrl,
    category,
  });

  res
    .status(201)
    .send({ article: createdArticles, message: "게시글을 작성했습니다." });
});

//게시글 수정
router.put("/:articleId", authMiddleware, async (req, res) => {
  const { articleId } = req.params;
  const { title, content, price, shopUrl, imageUrl,category } = req.body;

  const existArticles = await Articles.find({
    articleId: articleId,
  });
  
  if(!title || !content|| !price || !shopUrl || !imageUrl ||!category) {
    res.status(400).send({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  }

  if (!existArticles.length) {
    res.status(400).send({ errorMessage: "자신이 작성한 글만 수정 가능합니다." });
  } else {
    await Articles.updateOne(
      { articleId: articleId },
      { $set: { title, content, price, shopUrl, imageUrl,category } }
    );
    res.status(200).send({ message: "게시글을 수정했습니다." });
  }
});

//게시글 삭제
router.delete("/:articleId", authMiddleware, async (req, res) => {
  const { articleId } = req.params;

  const existArticles = await Articles.find({ articleId: articleId });

  if (!existArticles.length) {
    res.status(400).json({ errorMassege: "자신이 작성한 글만 삭제 가능합니다." });
  } else {
    await Articles.deleteOne({ articleId: articleId });
    res.status(200).json({ message: "게시글을 삭제했습니다." });
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