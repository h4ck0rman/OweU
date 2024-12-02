const express = require('express');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config(); 

// set up the prisma client for database interactions
const router = express.Router();

// Middleware for json request bodies 
router.use(express.json());

router.get('/sessions', (req, res) => {

});

router.get('/session/{id}', (req, res) => {

});

router.post('/add-session', authenticateToken, (req, res) => {
    res.json({message: "Hello"});
});

router.post('/edit-session', (req, res) => {
    
});

router.post('/remove-session', (req, res) => {
    
});

router.get('/partner', (req, res) => {

});

router.post('/verify-session', (req, res) => {

});

module.exports = router;