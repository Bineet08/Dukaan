const express = require("express");
const router = express.Router();
const cloudinary = require("../utils/cloudinary");
const { protect, adminOnly } = require("../middleware/authMiddleware");

// Max file size: 5MB
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

router.post("/", protect, adminOnly, async (req, res) => {
    try {
        const { image } = req.body;
        if (!image) {
            return res.status(200).json({
                url: "",
                public_id: null,
            });
        }

        // 1. Validate format and size
        if (image.startsWith("data:")) {
            // Validate Base64 image
            const matches = image.match(/^data:([^;]+);base64,(.+)$/);
            if (!matches || matches.length !== 3) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid image format structure"
                });
            }

            const mimeType = matches[1];
            const base64Data = matches[2];

            if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid MIME type: ${mimeType}. Allowed formats: JPG, PNG, WEBP, GIF.`
                });
            }

            // Calculate size in bytes: length * 0.75
            const sizeInBytes = (base64Data.length * 3) / 4;
            if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
                return res.status(400).json({
                    success: false,
                    message: `File too large. Maximum size is 5MB.`
                });
            }
        } else if (/^https?:\/\//i.test(image)) {
            // Allow valid external image URLs
            if (image.length > 2000) {
                return res.status(400).json({
                    success: false,
                    message: "Image URL length exceeds limit"
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Image must be a valid Base64 data URI or an HTTP image URL"
            });
        }

        // 2. Upload with Cloudinary limits
        const result = await cloudinary.uploader.upload(image, {
            folder: "dukaan/products",
            allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
            transformation: [{ width: 1000, height: 1000, crop: "limit" }]
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
