const contactService = require("../services/contactService");

/* =========================
   SEND CONTACT MESSAGE
   ========================= */
const sendContactMessage = async (req, res) => {
    const contact = await contactService.sendContactMessage(req.body);

    res.status(201).json({
        success: true,
        message: "Message received successfully",
        contactId: contact._id
    });
};

/* =========================
   ADMIN: GET ALL MESSAGES
   ========================= */
const getAllMessages = async (req, res) => {
    const messages = await contactService.getAllMessages();

    res.status(200).json({
        success: true,
        messages
    });
};

const asyncHandler = require("../utils/asyncHandler");

module.exports = {
    sendContactMessage: asyncHandler(sendContactMessage),
    getAllMessages: asyncHandler(getAllMessages)
};
