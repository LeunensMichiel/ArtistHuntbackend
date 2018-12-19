let mongoose = require('mongoose');
let crypto = require('crypto');
let jwt = require('jsonwebtoken');

let UserSchema = new mongoose.Schema({
    firstname: String,
    lastname: String,
    email: {type: String, lowercase: true, unique: true},
    hash: String,
    salt: String,
    validation_code: String,
    profile_image_filename: String,
    posts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'post'
    }]
});

UserSchema.index({email: 1});

/**
 * Generate hash and salt for password encryption
 * @param password
 */
UserSchema.methods.setPassword = function (password) {
    this.salt = crypto.randomBytes(32).toString('hex');
    this.hash = crypto.pbkdf2Sync(password, this.salt, 10000, 64, 'sha512').toString('hex')
};

/**
 * Checks if password is valid
 * @param password
 * @returns {boolean}
 */
UserSchema.methods.validPassword = function (password) {
    let hash = crypto.pbkdf2Sync(password, this.salt,
        10000, 64, 'sha512').toString('hex');
    return this.hash === hash;
};

/**
 * This generate a token
 * @returns {*}
 */
UserSchema.methods.generateJWT = function () {
    let today = new Date();
    let exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign({
        _id: this._id,
        email: this.email,
        exp: parseInt(exp.getTime() / 1000),
        firstname: this.firstname,
        lastname: this.lastname
    }, process.env.ARTISTHUNT_BACKEND_SECRET);
};

mongoose.model('user', UserSchema);