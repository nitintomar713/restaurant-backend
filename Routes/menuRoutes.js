const express = require('express');
const router = express.Router();
const multer = require('multer');
const {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require('../controllers/menuController');

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('Storing image in uploads/');
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Generated filename:', filename);
    cb(null, filename);
  },
});
const upload = multer({ storage });

// Routes with console logs
router.post('/', upload.single('image'), (req, res, next) => {
  console.log('POST /api/menu triggered');
  next();
}, createMenuItem);

router.get('/', (req, res, next) => {
  console.log('GET /api/menu triggered');
  next();
}, getMenuItems);

router.patch('/:id', upload.single('image'), (req, res, next) => {
  console.log(`PATCH /api/menu/${req.params.id} triggered`);
  next();
}, updateMenuItem);


router.delete('/:id', (req, res, next) => {
  console.log(`DELETE /api/menu/${req.params.id} triggered`);
  next();
}, deleteMenuItem);

module.exports = router;
