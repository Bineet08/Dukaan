const express = require("express");
const router = express.Router();
const { sendContactMessage, getAllMessages } = require("../controllers/contactController");
const { protect, adminOnly } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const { contactMessageSchema } = require("../validators/contactValidators");

router.post("/", validate(contactMessageSchema), sendContactMessage);
router.get("/", protect, adminOnly, getAllMessages);

module.exports = router;
