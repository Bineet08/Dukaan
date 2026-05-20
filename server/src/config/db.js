const mongoose = require("mongoose");



const connectDB = async (retries = 5, delayMs = 5000) => {
    const mongoUrlRaw = (process.env.MONGODB_URL || "").replace(/['"]/g, "");
    const defaultDb = 'dukaan';
    let mongoUrl = mongoUrlRaw;
    // If the provided URL does not include a database path, append the default DB
    if (mongoUrlRaw && !/\/[^\/\?]+(\?|$)/.test(mongoUrlRaw)) {
        mongoUrl = `${mongoUrlRaw.replace(/\/+$/,'')}/${defaultDb}`;
    }

    mongoose.connection.on('connected', () =>
        console.log('MONGODB CONNECTED'));

    mongoose.connection.on('error', (error) =>
        console.log('MONGODB CONNECTION ERROR:', error));

    for (let i = 1; i <= retries; i++) {
        try {
            console.log(`Connecting to MongoDB... (Attempt ${i}/${retries})`);
            console.log('Using MongoDB URL:', mongoUrl);
            await mongoose.connect(mongoUrl, {
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
