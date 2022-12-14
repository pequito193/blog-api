var express = require('express');
var router = express.Router();
const Post = require('./../models/post_model');
const Comment = require('./../models/comment_model');
const User = require('./../models/user_model');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    console.log(token);
    if (token == null) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.user = user;
        next();
    });
    
}

router.get('/', (req, res) => {
    Post.find({})
    .exec(function(err, posts) {
        if (err) {
            res.json({error: err});
        }
        res.json({data: posts});
    })
})

router.get('/list', (req, res) => {
    Post.find({})
    .exec(function(err, results) {
        if (err) {
            res.json({error: err});
        }
        res.json({data: results});
    });
})

router.get('/:id', (req, res) => {
    Post.find({title: req.params.id})
    .exec(function(err, posts) {
        if (err) {
            res.json({error: err});
        }
        Comment.find({postID: req.params.id //dont know yet
    })
        .exec(function(err, comments) {
            if (err) {
                res.json({error: err});
            }
            res.json({posts: posts, comments: comments});
        })
    })
})

router.post('/new', authenticateToken, (req, res) => {
    console.log(req.user);
    const post = new Post({
        id: crypto.randomBytes(32).toString('hex'),
        title: req.body.title,
        content: req.body.content,
        username: req.user,
        date: new Date(),
        likes: 0
    })
    post.save((err) => {
        if (err) {
            res.json({error: err});
        }
    })
})

router.delete('/delete/:id', (req, res) => {
    Post.findByIdAndDelete({id: req.params.id}, (err) => {
        if (err) {
            return next(err);
        }
    })
})

module.exports = router;