const jwt = require('jsonwebtoken');
require('dotenv').config(); 

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined in .env file');
}

function validateUsername(username) {
    const usernameRegex = /^(?![_\.])[A-Za-z0-9_.]{3,30}(?<![_\.])$/;
  
    if (!usernameRegex.test(username)) {
      return 'Username must be 3-30 characters long, can only contain alphanumeric characters, underscores, or dots, and must not start or end with a dot or underscore.';
    }
    return null;
}

function validatePassword(password) {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$%^&*!])[A-Za-z\d@#$%^&*!]{8,128}$/;
  
    if (!passwordRegex.test(password)) {
      return 'Password must be 8-128 characters long, contain at least one lowercase letter, one uppercase letter, one digit, and one special character.';
    }
    return null;
}

function validateCreds(req, res, next) {
    const { username, password } = req.body;

    // if username or password do not exist return error message
    if (!username || !password) {
        return res.status(400).json({error: "Username and Password are required!"});
    }

    // Validate username 
    const usernameError = validateUsername(username);
    if (usernameError) {
        return res.status(400).json({ error: usernameError });
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }

    next();
}

// Check if valid token is present in cookies
function authenticateToken(req, res, next) {
    try {
        // Fetch token from cookies
        const token = req.cookies?.token;

        // if token does not exist, return with error message
        if (!token) {
            return res.status(401).json({ message: 'Not Logged in! Token missing.' });
        }

        // verify the jwt and fetch the payload
        const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS512'] });
        req.user = decoded.id;

        // return to calling function
        next();

    } catch (error) {
        // Handle invalid or expired tokens
        console.log(`Authentication Error: ${error}`);
        res.status(401).json({message: 'Authentication failed. Invalid or expired token.'});
    }
}

module.exports = { validateCreds, authenticateToken }