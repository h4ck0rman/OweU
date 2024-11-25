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

    if (!username) {
        return res.status(400).json({error: "Username is missing"});
    }
    // Validate username (if present)
    if (username) {
        const usernameError = validateUsername(username);
        if (usernameError) {
            return res.status(400).json({ error: usernameError });
        }
    }

    if (!password) {
        return res.status(400).json({error: "Password is missing"});
    }

    // Validate password
    const passwordError = validatePassword(password);
    if (passwordError) {
        return res.status(400).json({ error: passwordError });
    }

    next();
}

function authenticateToken(req, res, next) {
    next();
}

function authorizeToken(req, res, next) {
    next();
}

module.exports = { validateCreds, authenticateToken, authorizeToken }