const mongoose = require("mongoose");



const connectDB = async (retries = 5, delayMs = 5000) => {
    const mongoUrl = (process.env.MONGODB_URL || "").replace(/['"]/g, "");

    mongoose.connection.on('connected', () =>
        console.log('MONGODB CONNECTED'));

    mongoose.connection.on('error', (error) =>
        console.log('MONGODB CONNECTION ERROR:', error));

    for (let i = 1; i <= retries; i++) {
        try {
            console.log(`Connecting to MongoDB... (Attempt ${i}/${retries})`);
            await mongoose.connect(`${mongoUrl}/dukaan`, {
                serverSelectionTimeoutMS: 5000
            });
            return;
        } catch (error) {
            console.error(`MongoDB connection attempt ${i} failed. Error:`, error.message);
            if (i === retries) {
                console.error("Could not connect to MongoDB. Exiting.");
                throw error;
            }
            console.log(`Retrying in ${delayMs / 1000} seconds...`);
            await new Promise(res => setTimeout(res, delayMs));
        }
    }
}

module.exports = connectDB;
