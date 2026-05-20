const Contact = require("../models/Contact");

const sendContactMessage = async ({ name, email, message }) => {
    return await Contact.create({
        name,
        email,
        message
    });
};

const getAllMessages = async () => {
    return await Contact.find({})
        .sort({ createdAt: -1 })
        .lean();
};

module.exports = {
    sendContactMessage,
    getAllMessages
};
