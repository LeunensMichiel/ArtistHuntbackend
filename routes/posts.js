let express = require('express');
let router = express.Router();
let mongoose = require('mongoose');

let Post = mongoose.model('post');
let User = mongoose.model('user');

let jwt = require('express-jwt');
let auth = jwt({secret: process.env.ARTISTHUNT_BACKEND_SECRET});
