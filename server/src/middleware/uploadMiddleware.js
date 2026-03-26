const multer    = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinaryConfig");
const AppError  = require("../utils/AppError");

// ── Multer — memory storage (no disk writes) ───────────────
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new AppError("Only image files are allowed", 400), false);
  }
};

const multerUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
});

// ── Upload buffer to Cloudinary via stream ─────────────────
const uploadToCloudinary = (buffer, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [
          { width: 800, height: 800, crop: "limit", quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (error, result) => {
        if (error) reject(new AppError("Image upload failed", 500));
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });

// ── Middleware: upload listing images (max 5) ──────────────
const uploadListingImages = [
  multerUpload.array("images", 5),
  async (req, res, next) => {
    const toArray = (value) => {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter(Boolean);
      return [value].filter(Boolean);
    };

    const existingImages = toArray(req.body.existingImages);

    if (!req.files || req.files.length === 0) {
      if (existingImages.length > 0) {
        req.body.images = existingImages;
      }
      delete req.body.existingImages;
      return next();
    }

    try {
      const urls = await Promise.all(
        req.files.map((f) => uploadToCloudinary(f.buffer, "campus_marketplace/listings"))
      );

      const mergedImages = [...existingImages, ...urls];
      if (mergedImages.length > 5) {
        return next(new AppError("Maximum 5 images allowed", 400));
      }

      req.body.images = mergedImages;
      delete req.body.existingImages;
      next();
    } catch (err) {
      next(err);
    }
  },
];

// ── Middleware: upload single avatar ──────────────────────
const uploadAvatar = [
  multerUpload.single("avatar"),
  async (req, res, next) => {
    if (!req.file) return next();

    try {
      const url = await uploadToCloudinary(req.file.buffer, "campus_marketplace/avatars");
      req.body.avatar = url;
      next();
    } catch (err) {
      next(err);
    }
  },
];

module.exports = { uploadListingImages, uploadAvatar };
