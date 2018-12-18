const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const User = mongoose.model('user');


passport.use(new LocalStrategy({
        /**
         * Because we use email instead of username as identifier
         * We need to tell passport specifically to look for the email field en not for the username field
         */
        usernameField: 'email',
        passwordField: 'password'
    },
    /**
     * check of de inlog gegevens goed zijn
     * @param email
     * @param password
     * @param done
     */
    function (email, password, done) {
        let query = User.findOne({email: email});
        query.exec(function (err, user) {
            if (err) {
                return done(err);
            }

            if (!user) {
                return done(null, false, {message: 'Incorrect email.'});
            }

            if (!user.validPassword(password)) {
                return done(null, false, {message: 'Incorrect email.'});
            }

            return done(null, user);
        });
    }));