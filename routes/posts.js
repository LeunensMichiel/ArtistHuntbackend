let express = require('express');
let router = express.Router();

let jwt = require('express-jwt');
let auth = jwt({secret: process.env.ARTISTHUNT_BACKEND_SECRET});
let fileUploadMulter = require('../config/multer_config');
let fileManager = require('../config/manage_files');

let mongoose = require('mongoose');

let Post = mongoose.model('post');
let User = mongoose.model('user');


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

        queryUpdateUserWithPost.exec(function (err, user) {
            if (err) {
                post.remove();
                return next(err)
            }
            res.json(post);
        });
    })
});

router.put('/post/audio', auth, fileUploadMulter.uploadAudio.single("file"), function (req, res, next) {
    if (!req.file) {
        return next(new Error("Wrong file type!"));
    }
    let postQuery = Post.findOneAndUpdate(
        {_id: req.params.post_with_audio},
        {$set: {"post_audio_filename": req.file.filename}},
        {new: true}
    );
    postQuery.exec(function (err, post) {
        if (err) {
            return next(err);
        }
        let oldPost = JSON.parse(req.body.post);
        if (oldPost.post_audio_filename) {
            fileManager.removeFile(oldPost.post_audio_filename, "music");
        }
        res.json(post);
    });
});

router.put('/post/image', auth, fileUploadMulter.uploadPostImage.single("file"), function (req, res, next) {
    console.log(req.file);
    if (!req.file) {
        return next(new Error("Wrong file type!"));
    }
    let tempPost = JSON.parse(req.body.post);
    let post = new Post(tempPost);
    post.post_image_filename = req.file.filename;

    post.save(function (err, post) {
        if (err) {
            console.log(err);
            return next(err);
        }
        let updateUserQuery = User.updateOne(
            {_id: post.user_id}, {"$push": {posts: post}}
        );
        updateUserQuery.exec(function (err, post) {
            if (err) {
                post.remove();
                return next(err);
            }
            if (tempPost.post_image_filename) {
                fileManager.removeFile(tempPost.post_image_filename, "images");
            }
            res.json(post);
        });
    });
});

router.post('/post/:post/updateLikers', auth, function (req, res, next) {
    let post = req.post;
    if (post.likers.contains(req.body.liker)) {
        post.likers.pop(req.body.liker)
    } else {
        post.likers.push(req.body.liker)
    }
    post.save(function (err) {
        if (err) {
            return next(err);
        }
        res.json(req.body);
    });
});

router.delete('/post/:post', auth, function (req, res, next) {
    req.post.remove(function (err, post) {
        if (err) return next(err);

        if (post.post_audio_filename) {
            fileManager.removeFile(post.post_audio_filename, "music");
        }
        if (post.post_image_filename) {
            fileManager.removeFile(post.post_image_filename, "images");
        }

        res.json({'message': 'Delete was successful'});

    });

});

module.exports = router;
