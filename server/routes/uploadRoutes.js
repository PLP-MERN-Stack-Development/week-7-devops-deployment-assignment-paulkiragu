// routes/uploadRoutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadImage } = require("../controllers/uploadController");

const router = express.Router();

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("image"), uploadImage);

module.exports = router;
