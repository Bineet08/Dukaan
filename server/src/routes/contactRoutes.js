const express = require("express");
const router = express.Router();
const { sendContactMessage, getAllMessages } = require("../controllers/contactController");
const { protect, admin } = require("../middleware/authMiddleware");


router.post("/", sendContactMessage);
router.get("/", protect, admin, getAllMessages);

module.exports = router;
