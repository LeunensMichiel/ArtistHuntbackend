const multer = require('multer');


const filename = function (req, file, cb) {
    cb(null, (new Date().toISOString().replace(/[^a-zA-Z0-9]/g, "") + file.originalname).replace(" ", ""));
};

/**
 * Config van post_audio
 * @type {DiskStorage}
 */
const storageSound = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/music');
    },
    filename: filename
});

/**
 * Config van post_image
 * @type {DiskStorage}
 */
const storageImage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images');
    },
    filename: filename
});

const audioFileFilter = (req, file, cb) => {
    if (
        file.mimetype == 'audio/mpeg' ||
        file.mimetype == 'audio/mp3' ||
        file.mimetype == 'audio/aac' ||
        file.mimetype == 'audio/x-aac' ||
        file.mimetype == 'audio/wav' ||
        file.mimetype == 'audio/wave'
    ) {
        cb(null, true);
    }
    else {
        cb(null, false)
    }
};

const imagefileFilter = (req, file, cb) => {
    if (
        file.mimetype === 'image/jpg' ||
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/JPG' ||
        file.mimetype === 'image/JPEG' ||
        file.mimetype === 'image/PNG' ||
        file.mimetype === 'image/png'
    ) {
        cb(null, true);
    }
    else {
        cb(null, false)
    }
};

module.exports = {
    uploadAudio: multer({
        storage: storageSound,
        limits: {
            files: 1,
            fileSize: 1024 * 1024 * 10 // max 10mb
        },
        fileFilter: audioFileFilter
    }),
    uploadPostImage: multer({
        storage: storageImage,
        limits: {
            files: 1,
            fileSize: 1024 * 1024 * 5 // max 5mb
        },
        fileFilter: imagefileFilter
    }),
};