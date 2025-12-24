const Contact = require("../models/Contact");

/* =========================
   SEND CONTACT MESSAGE
   ========================= */
const sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const contact = await Contact.create({
            name,
            email,
            message,
        });

        res.status(201).json({
            success: true,
            message: "Message received successfully",
            contactId: contact._id,
        });
    } catch (error) {
        console.error("CONTACT ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message",
        });
    }
};

/* =========================
   ADMIN: GET ALL MESSAGES
   ========================= */
const getAllMessages = async (req, res) => {
    try {
        const messages = await Contact.find({})
            .sort({ createdAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            messages,
        });
    } catch (error) {
        console.error("GET CONTACT MESSAGES ERROR:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch messages",
        });
    }
};

module.exports = {
    sendContactMessage,
    getAllMessages,
};
