const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateCreds } = require('../middleware/auth');
const User  = require('../models/User');

require('dotenv').config(); 

// set up the prisma client for database interactions

const router = express.Router();

// secret key for signing and verifying JWTs
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env file');
}

// Middleware for json request bodies 
router.use(express.json());

/**
 * @route POST /auth/register
 * @desc Register a new user to the database
 * @access Public
 */
router.post('/register', validateCreds, async(req, res) => {
    const { password, username } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // create user 
        const newUser = new User({
            username, 
            password_hash: hashedPassword
        });

        // save user to mongodb database
        await newUser.save();

        res.status(201).json({ message: "User has been created!" });
    
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "There was an issue with the registration."});
    }
});

/**
 * @route POST /auth/login
 * @desc Log in an existing user
 * @access Public
 */
router.post('/login', validateCreds, async(req, res) => {
    const { username, password } = req.body;

    try {
        // Fetch user record from mongodb through username
        const user = await User.findOne({ username });

        // if user does not exist, return generic login error message
        if (!user) {
            return res.status(401).json({ error: 'Either the username or the password are incorrect!' });
        }    

        // compare password hashes with database
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        // if password hash is invalid, return generic login error message
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Either the username or the password are incorrect!' });
        } 

        // generate jwt with secret and userID
        const token = jwt.sign({id: user.id}, JWT_SECRET, {algorithm: 'HS512', expiresIn: '15m'});

        // add token as a cookie on the user browser
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV == 'production',
            sameSite: 'strict',
            maxAge: 10 * 60 * 1000,
        });

        // return response
        res.status(200).json({message: "Login Successful!"});

    } catch (error) {
        console.error(error);
        // return authentication error message for all other exceptions
        res.status(400).json({ error: "There was an issue with logging in."});
    }
});

module.exports = router;