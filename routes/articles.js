const express = require("express");
const authMiddleware = require("../middlewares/auth-middleware");
const Articles = require("../models/articles");
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

  const [articles] = await Articles.find({ articleId: articleId });
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
    .send({ articles: createdArticles, message: "게시글이 작성되었습니다." });
});

//게시글 수정
router.put("/:articleId", authMiddleware, async (req, res) => {
  const { articleId } = req.params;
  const { title, content, price, shopUrl, imageUrl,category } = req.body;

  const existArticles = await Articles.find({
    articleId: articleId,
  });

  if (!existArticles.length) {
    res.status(400).send({ errormessage: "게시글 작성자가 아닙니다." });
  } else {
    await Articles.updateOne(
      { articleId: articleId },
      { $set: { title, content, price, shopUrl, imageUrl,category } }
    );
    res.status(200).send({ message: "수정이 완료되었습니다." });
  }
});

//게시글 삭제
router.delete("/:articleId", authMiddleware, async (req, res) => {
  const { articleId } = req.params;

  const existArticles = await Articles.find({ articleId: articleId });

  if (!existArticles.length) {
    res.status(400).json({ errormassege: "게시글 작성자가 아닙니다." });
  } else {
    await Articles.deleteOne({ articleId: articleId });
    res.status(200).json({ message: "게시글을 삭제하였습니다." });
  }
});

module.exports = router;
