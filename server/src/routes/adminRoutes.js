const express = require("express");
const router = express.Router();

const {
  getUsers,
  banUser,
  unbanUser,
  getListings,
  deleteListing,
  getAuditLogs,
} = require("../controllers/adminController");

const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { validateQuery } = require("../middleware/validate");

const {
  listUsersQuerySchema,
  banUserSchema,
  listListingsQuerySchema,
  auditLogQuerySchema,
} = require("../validations/admin.validation");

// Every route below requires a logged-in admin
router.use(protect, adminOnly);

router.get("/users", validateQuery(listUsersQuerySchema), getUsers);
router.patch("/users/:id/ban", validate(banUserSchema), banUser);
router.patch("/users/:id/unban", unbanUser);

router.get("/listings", validateQuery(listListingsQuerySchema), getListings);
router.delete("/listings/:id", deleteListing);

router.get("/audit-logs", validateQuery(auditLogQuerySchema), getAuditLogs);

module.exports = router;
