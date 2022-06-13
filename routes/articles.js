const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const Articles = require("../models/articles");
const User = require("../models/user");
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
  const userNickname = res.locals.user.nickname;
  const { articleId } = req.params;
  const { title, content, price, shopUrl, imageUrl,category } = req.body;
  const existArticles = await Articles.findOne({
    articleId:articleId
  });
  if(!title || !content|| !price || !shopUrl || !imageUrl ||!category) {
     res.status(400).send({
      errorMessage: "작성란을 모두 입력해주세요.",
    });
  }
console.log(existArticles)
  if (userNickname === existArticles['nickname']) {
    await Articles.updateOne(
      { articleId: articleId },
      { $set:
        {
        title,
        content,
        price,
        shopUrl,
        imageUrl,
        category } }
    );
  } else {
    return res.status(400).send({ errorMessage: "자신이 작성한 글만 수정 가능합니다."  });
  }
});


//게시글 삭제
router.delete("/:articleId", authMiddleware, async (req, res) => {
  const userNickname = res.locals.user.nickname;
  const { articleId } = req.params;
  const existArticles = await Articles.findOne({ articleId: articleId });
  console.log(existArticles);
  
  if (userNickname === existArticles["nickname"]) {
    await Articles.deleteOne({ articleId: articleId });
    res.status(200).send({ message: "게시글을 삭제했습니다." });
  } else {
    res
      .status(400)
      .send({ errorMessage: "자신이 작성한 글만 삭제 가능합니다." });
  }  
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
