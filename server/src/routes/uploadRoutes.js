const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const { protect, admin } = require("../middleware/authMiddleware");

router.post("/", protect, admin, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(200).json({
                url: "",
                public_id: null,
            });
        }

        const result = await cloudinary.uploader.upload(image, {
            folder: "dukaan/products",
        });

        res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id,
        });
    } catch (error) {
        console.error("CLOUDINARY UPLOAD ERROR:", error);
        res.status(500).json({ message: "Image upload failed" });
    }
});


module.exports = router;
