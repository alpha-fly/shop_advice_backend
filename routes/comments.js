const express = require('express');
const User = require('../models/user');
const Articles = require('../models/article');
const Comments = require('../models/comment');
const Counters = require('../models/counter');
const authMiddleware = require('../middlewares/auth-middleware');
// const { db } = require('../models/articles');
const router = express.Router();


// <---댓글 작성 API-->
// 댓글은 '어디에 달린 댓글인지' 즉 원글이 중요하기 때문에 articleId를 함께 DB에 저장합니다.
router.post('/:articleId', authMiddleware, async (req, res) => {
    const { articleId } = req.params;
    const nickname = res.locals.user.nickname;    
    const { comment } = req.body;    
    const createdAt = new Date();

    if (!comment) {
        return res.status(400).json({            
            errorMessage: '작성란을 채워주세요.',
        });
    }
    //commentId 자동 카운팅
    let counter = await Counters.findOne({ name: 'Comments' }).exec();
    if (!counter) {
        counter = await Counters.create({ name: 'Comments', count: 0 });
    }
    counter.count++;
    counter.save();
    let commentId = counter.count;

    const writtenComment = await Comments.create({
        commentId,
        articleId,
        comment,
        nickname,
        createdAt,
    });

    res.json({ message: '댓글을 작성했습니다.' });
});


// <---댓글 조회 API-->
router.get('/:articleId', async (req, res) => {
    const { articleId } = req.params;
    const all_comments = await Comments.find();

    //여기부터 async fuction 내부에서 .filter를 쓰기 위한 몸부림입니다.
    const filtered_comments = await asyncFilter(all_comments, async (item) => {
        await doAsyncStuff();
        return item['articleId'] == articleId;
    });

    function doAsyncStuff() {
        return Promise.resolve();
    }

    async function asyncFilter(arr, callback) {
        const fail = Symbol();
        return (
            await Promise.all(
                arr.map(async (item) => ((await callback(item)) ? item : fail))
            )
        ).filter((i) => i !== fail);
    }
    //여기까지 잘 뜯어보기

    function compare(key) {
        return (a, b) =>
            Date.parse(a[key]) < Date.parse(b[key])
                ? 1
                : Date.parse(a[key]) > Date.parse(b[key])
                ? -1
                : 0;
    }
    const comments = filtered_comments.sort(compare('createdAt'));

    res.json({
        comments,
    });
});


// <---댓글 삭제 API-->
router.delete('/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const comment = await Comments.findOne({ commentId: commentId });
    let nickname = res.locals.user.nickname;
    
    if (nickname === comment['nickname']) {
        await Comments.deleteOne({ commentId: commentId });
    } else {
        return res.status(401).json({         
            errorMessage: '작성자만 삭제할 수 있습니다.',
        });
    }

    res.json({ message: '댓글을 삭제하였습니다.' });
});


// <---댓글 삭제 API-->
router.put('/:commentId', authMiddleware, async (req, res) => {
    const { commentId } = req.params;
    const original_comment = await Comments.findOne({ commentId: commentId });
    const { comment } = req.body;
    let nickname = res.locals.user.nickname;
    
    if (!original_comment) {
        return res.status(400).json({            
            errorMessage: '작성란을 채워주세요.',
        });
    }

    if (nickname === original_comment['nickname']) {
        await Comments.updateOne(
            { commentId: commentId },
            { $set: { comment } }
        );
    } else {
        return res.status(401).json({            
            errorMessage: '작성자만 수정할 수 있습니다.',
        });
    }

    res.json({ message: '댓글을 수정했습니다.' });
});

module.exports = router;
