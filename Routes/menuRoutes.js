const express = require("express");
const {
  createMenuItem,
  getMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");
const { getUploadMiddleware } = require("../utils/cloudinary");

const router = express.Router();

// console.log("📂 [Menu Routes] Initializing Multer middleware for uploads");
const upload = getUploadMiddleware();  // local storage multer middleware

// Middleware to log each request on this router
router.use((req, res, next) => {
  console.log(`📥 [Menu API] ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware to check & log uploaded file presence
const logUploadedFile = (req, res, next) => {
  if (req.file) {
    console.log("✅ [Upload] File received:");
    console.log(req.file);
  } else {
    console.warn("⚠️ [Upload] No file received in request");
  }
  next();
};

// GET all menu items
router.get("/", (req, res, next) => {
  console.log("🔍 [Menu API] Fetching all menu items...");
  next();
}, getMenuItems);

// POST create new menu item with file upload
router.post(
  "/",
  (req, res, next) => {
    console.log("📝 [Menu API] Creating a new menu item...");
    next();
  },
  upload.single("image"),
  logUploadedFile,
  createMenuItem
);

// PUT update existing menu item with optional file upload
router.put(
  "/:id",
  (req, res, next) => {
    console.log(`✏️ [Menu API] Updating menu item with ID: ${req.params.id}`);
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    if (req.file) {
      console.log(`✅ [Upload] Updated file received: ${req.file.originalname} (${req.file.mimetype})`);
    } else {
      console.warn("⚠️ [Upload] No file received for update");
    }
    next();
  },
  updateMenuItem
);

// PATCH update (same handler, same middleware)
router.patch(
  "/:id",
  (req, res, next) => {
    console.log(`✏️ [Menu API] PATCH Updating menu item with ID: ${req.params.id}`);
    next();
  },
  upload.single("image"),
  (req, res, next) => {
    if (req.file) {
      console.log(`✅ [Upload] Updated file received: ${req.file.originalname} (${req.file.mimetype})`);
    } else {
      console.warn("⚠️ [Upload] No file received for update");
    }
    next();
  },
  updateMenuItem
);


// DELETE menu item by id
router.delete("/:id", (req, res, next) => {
  console.log(`🗑️ [Menu API] Deleting menu item with ID: ${req.params.id}`);
  next();
}, deleteMenuItem);

module.exports = router;
