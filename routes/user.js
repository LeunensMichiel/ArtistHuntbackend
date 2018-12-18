let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

let jwt = require('express-jwt');
let auth = jwt({secret: process.env.ARTISTHUNT_BACKEND_SECRET});


let User = mongoose.model('user');

router.post('/register', function (req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({message: 'email of wachtwoord was niet ingevuld'});
    }
    if (!validator.validate(req.body.email)) {
        return res.status(400).json({message: 'Input invalid'});
    }

    let user = new User();
    user.firstname = req.body.firstname;
    user.lastname = req.body.lastname;
    user.email = req.body.email;
    user.setPassword(req.body.password);
    user.save(function (err) {
        if (err) {
            return next(err);
        }
        return res.json({
            token: user.generateJWT(),
            _id: user._id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email
        })
    });
});

router.post('/login', function (req, res, next) {
    if (!req.body.email || !req.body.password) {
        return res.status(400).json({message: 'email of wachtwoord was niet ingevuld'});
    }

    passport.authenticate('local', function (err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.status(401).json(info);
        }
        if (user) {
            return res.json({
                //Aangepast door Michiel op 30/11 om bugs proberen op te lossen van userInfo
                token: user.generateJWT(),
                _id: user._id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email
            });
        } else {
            return res.status(401).json(info);
        }
    })(req, res, next);
});

router.post('/checkemail', function (req, res, next) {
    User.find({email: req.body.email},
        function (err, result) {
            if (result.length) {
                res.json({'email': 'alreadyexists'})
            } else {
                res.json({'email': 'ok'})
            }
        });
});

router.get('/user/:user', auth, function (req, res, next) {
    res.json(req.paramUser)
});

router.param('user', function (req, res, next, id) {
    let query = User.findById(id);

    query.exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('not found' + id));
        }
        req.paramUser = user;
        return next();
    })
});

module.exports = router;