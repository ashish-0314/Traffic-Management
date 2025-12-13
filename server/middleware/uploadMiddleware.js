const multer = require('multer');
const path = require('path');

// Use memory storage to get the file buffer for ImageKit upload
const storage = multer.memoryStorage();

const checkFileType = (file, cb) => {
    const filetypes = /jpg|jpeg|png|mp4|mov/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images and Videos only!');
    }
};

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});

module.exports = upload;

