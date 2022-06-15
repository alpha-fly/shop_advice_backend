require("dotenv").config();
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
    const { authorization } = req.headers;
    
    if (!authorization) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;
    }

    const [tokenType, tokenValue] = authorization.split(' ');

    if (tokenType !== 'Bearer') {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;
    }

    try {
        const { userId } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);

        User.findOne({userId})
            .exec()
            .then((user) => {                
                res.locals.user = user;
                next();
            });
    } catch (error) {
        res.status(401).send({
            errorMessage: '로그인 후 사용하세요',
        });
        return;        
    }
};
