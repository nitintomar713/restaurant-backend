const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary');


/**
 * Multer middleware configured to save locally.
 * @returns multer middleware
 */
const getUploadMiddleware = () => {
  // console.log(`⚙️ Initializing multer middleware with local storage`);

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); // local uploads folder
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + file.originalname.split('.').slice(0, -1).join('.');
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    },
  });

  return multer({ storage });
};

module.exports.getUploadMiddleware = getUploadMiddleware;
module.exports.cloudinary = cloudinary;
