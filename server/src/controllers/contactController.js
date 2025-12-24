const sendContactMessage = async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({ message: "All fields are required" });
        }

        console.log("CONTACT MESSAGE:", { name, email, message });

        res.status(200).json({ message: "Message received" });
    } catch (error) {
        console.error("CONTACT ERROR:", error);
        res.status(500).json({ message: "Failed to send message" });
    }
};

module.exports = { sendContactMessage };
