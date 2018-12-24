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

router.post('/post/:post_with_audio', auth, fileUploadMulter.uploadAudio.single("file"), function (req, res, next) {
    console.log("Wuk1");
    if (!req.file) {
        console.log("Wuk2");
        return next(new Error("Wrong file type!"));
    }
    console.log("Wuk3");
    let postQuery = Post.findOneAndUpdate(
        {_id: req.params.post_with_audio},
        {$set: {"post_audio_filename": req.file.filename}},
        {new: true}
    );
    console.log("Wuk4");
    postQuery.exec(function (err, post) {
        if (err) {
            console.log("Wuk5");
            return next(err);
        }
        console.log("Wuk6");

        let oldPost = JSON.parse(req.body.post);
        console.log("Wuk7");

        if (oldPost.post_audio_filename) {
            console.log("Wuk8");
            fileManager.removeFile(oldPost.post_audio_filename, "music");
        }

        res.json(post);
    });
});

router.put('/post/image', auth, fileUploadMulter.uploadPostImage.single("file"), function (req, res, next) {
    console.log("Wuk1");
    console.log(req.file);
    if (!req.file) {
        console.log("Wuk2");
        return next(new Error("Wrong file type!"));
    }
    console.log("Wuk3");
    let tempPost = JSON.parse(req.body.post);
    console.log("Wuk4");
    let post = new Post(tempPost);
    console.log("Wuk5");
    post.post_image_filename = req.file.filename;
    console.log("Wuk6");

    post.save(function (err, post) {
        console.log("WukExtra");
        if (err) {
            console.log(err);
            return next(err);
        }
        let updateUserQuery = User.updateOne(
            {_id: post.user_id}, {"$push": {posts: post}}
        );
        console.log("Wuk7");

        updateUserQuery.exec(function (err, post) {
            if (err) {
                console.log("Wuk8");

                post.remove();
                return next(err);
            }
            console.log("Wuk9");
            if (tempPost.post_image_filename) {
                console.log("Wuk10");
                fileManager.removeFile(tempPost.post_image_filename, "images");
            }
            console.log("Wuk1");
            res.json(post);
        });
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
