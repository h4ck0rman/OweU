const mongoose = require('mongoose');
require('dotenv').config();

const mongoDB_url = process.env.MONGODB_URL;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(mongoDB_url);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }
};

module.exports = connectDB;