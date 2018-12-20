let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

let Post = mongoose.model('post');
let User = mongoose.model('user');

let jwt = require('express-jwt');
let auth = jwt({secret: process.env.ARTISTHUNT_BACKEND_SECRET});

router.param('post', function (req, res, next, id) {
   let query = Post.findById(id);

   query.exec(function (err, post) {
      if (err) {
          return next(err)
      }
      if (!post) {
          return next(new Error('Post not found' + id));
      }
      req.post = post;
      return next();
   });
});

router.param('user', function (req, res, next, id) {
    let query = User.findById(id).populate('posts');
    query.exec(function (err, user) {
        if (err) {
            return next(err);
        }
        req.userParam = user;
        return next();
    });
});

router.get('/post', auth, function (req, res, next) {
    let findallquery = Post.find();
    findallquery.exec(function (err, posts) {
        if (err) {
            return next(err);
        }
        res.json(posts);
    });
});

router.get('/post/:user', auth, function (req, res, next) {
    res.json(req.userParam.posts);
});
router.post('/post', auth, function (req, res, next) {
    let post = new Post(req.body);
    post.save(function (err, post) {
        if (err) {
            return next(err)
        }
        let queryUpdateUserWithPost = User.updateOne({_id: req.body.user_id},
            {"$push": {posts: post}});

        queryUpdateUserWithPost.exec(function(err, user){
            if (err) {
                post.remove();
                return next(err)
            }
            res.json(post);
        });
    })
});

module.exports = router;
