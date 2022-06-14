const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const Articles = require("../models/articles");
const User = require("../models/user");
const Counters = require("../models/counters");

const multer = require("multer");
const path = require("path");

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

  const [articles] = await Articles.find({ articleId: articleId }); // findOne으로 변경
  res.json({
    articles,
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

  if (!title || !content) {
    res.status(400).send({
      errormessage: "제목과 내용을 작성해주세요.",
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
    .send({ articles: createdArticles, message: "게시글이 작성되었습니다." }); //게시글 작성 여부만 리턴하면 되지 않나요? 작성된 게시글을 보내주는 이유는?
});

//게시글 수정
router.put("/:articleId", authMiddleware, async (req, res) => {
  const { articleId } = req.params;
  const userNickname = res.locals.user.nickname;
  const { title, content, price, shopUrl, imageUrl, category } = req.body;

  const existArticles = await Articles.findOne({
    articleId: articleId,
  });

  
  if (userNickname === existArticles['nickname']) {
    await Articles.updateOne(
      { articleId: articleId },
      { $set: { title, content, price, shopUrl, imageUrl, category } }
    );
    res.status(200).send({ message: "수정이 완료되었습니다." });
  } else {
    return res.status(400).send({ errorMessage: "게시글 작성자가 아닙니다." });
  }
});

//게시글 삭제

router.delete("/:articleId", authMiddleware, async (req, res) => {
  const { articleId } = req.params;
  const userNickname = res.locals.user.nickname;
  console.log(userNickname)
  const article = await Articles.findOne({ articleId: articleId });
  console.log(article)
  console.log(article["nickname"]);
  
  if (userNickname === article["nickname"]) {
    await Articles.deleteOne({ articleId: articleId });    
    res.status(200).send({ message: "게시글을 삭제했습니다." });    
  } else {
    return res.status(401).send({ errorMessage: "자신이 작성한 글만 삭제 가능합니다." });    
  }
  
});

//카테고리
router.get('/category/:category', async(req,res) => {
  const {category} = req.params;
  const [categories] =await Articles.find({category:category});
  res.send({
    categories,
  });
});

//좋아요 API
router.post("/like/:articleId", authMiddleware, async (req, res) => {
  // 변수 UserLikesArray에, User DB 에서 해당 유저가 지금까지 좋아요 한 글들의 articleId를 모아놓은 [배열] user.likes를 할당한다.
  const { user } = res.locals;
  let UserLikesArray = user.likes;

  // 변수 articleLikes에, 지금 좋아요 또는 좋아요 해제 하려는 글에 지금까지 좋아요 갯수가 몇 개인지 불러온다.
  const { articleId } = req.params;
  const article = await Articles.findOne({ articleId: Number(articleId) }); // articleId 데이터타입이 Number로 들어가 있어서. 수정 필요.
  let articleLikes = article["likes"];

  // UserLikesArray에 이미 좋아요 하려는 글의 articleId가 포함되어 있다면, 좋아요 해제를 실행한다.
  // UserLikesArray에서 현재 글의 articleId를 제거해주고
  // 현재 글의 likes 숫자를 하나 줄여준다.
  if (UserLikesArray.includes(articleId)) {
    const likes = UserLikesArray.filter((item) => item !== articleId);
    await User.updateOne({ userId: user.userId }, { $set: { likes } });

    articleLikes--;
    await Articles.updateOne({ articleId }, { $set: { likes: articleLikes } });

    res.status(200).send({ message: "사세요! 해제하셨습니다." });

    // UserLikesArray에 이미 좋아요 하려는 글의 articleId가 없다면! 좋아요를 실행한다.
    // UserLikesArray에서 현재 글의 articleId를 추가해주고
    // 현재 글의 likes 숫자를 하나 더해준다.
  } else {
    UserLikesArray.push(articleId);
    await User.updateOne(
      { userId: user.userId },
      { $set: { likes: UserLikesArray } }
    );

    articleLikes++;
    await Articles.updateOne({ articleId }, { $set: { likes: articleLikes } });
    res.status(200).send({ message: "사세요! 하셨습니다." });
  }
});

//좋아요 갯수 API
router.get("/like/:articleId", async (req, res) => {
  const { articleId } = req.params;
  const article = await Articles.findOne({ articleId: Number(articleId) });
  const likes = article["likes"];

  res.json({
    likes,
  });
});

module.exports = router;
