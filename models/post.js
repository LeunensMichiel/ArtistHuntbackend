let mongoose = require('mongoose');

let PostSchema = new mongoose.Schema({
    user_id: mongoose.Schema.Types.ObjectId,
    title: String,
    description: String,
    type: String,
    post_image_filename: String,
    post_audio_filename: String,
    date: String,
    likers: [String]
});

PostSchema.index({user_id: 1});

mongoose.model('post', PostSchema);