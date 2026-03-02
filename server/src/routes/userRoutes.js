const express  = require("express");
const router   = express.Router();

const { getProfile, updateProfile, changePassword } = require("../controllers/userController");
const { protect }          = require("../middleware/authMiddleware");
const validate             = require("../middleware/validate");
const { uploadAvatar }     = require("../middleware/uploadMiddleware");
const { updateProfileSchema, changePasswordSchema } = require("../validations/user.validation");

// All user routes require auth
router.use(protect);

// ── Profile ─────────────────────────────────────────────────
router.get("/:id", getProfile);

router.put(
  "/profile",
  ...uploadAvatar,                      // multer + cloudinary
  validate(updateProfileSchema),         // joi
  updateProfile
);

// ── Password ───────────────────────────────────────────────
router.put("/change-password", validate(changePasswordSchema), changePassword);

module.exports = router;