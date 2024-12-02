const express = require('express');
const authRoutes = require('./routes/auth');
const sessionRoutes = require('./routes/sessions');
const cookieParser = require("cookie-parser");
const connectDB = require('./db');
require('dotenv').config(); 

// initialise the application
const app = express()

// connecting to the mongoDB 
connectDB();

// Middleware 
app.use(express.json());
app.use(cookieParser());

// Routes 
app.use('/auth', authRoutes);
app.use('/sessions', sessionRoutes)

// Start the server
const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});