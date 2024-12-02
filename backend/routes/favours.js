const express = require('express');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config(); 

// set up the prisma client for database interactions
const router = express.Router();

// Middleware for json request bodies 
router.use(express.json());

router.get('/', authenticateToken, (req, res) => {
    res.json({message: "This works"});
});

router.get('/favour/{id}', authenticateToken, (req, res) => {

});

router.post('/add-favour', authenticateToken, (req, res) => {
    res.json({message: "This works even without authenticaiotnd!!!"});
});

router.post('/edit-favour', authenticateToken, (req, res) => {
    
});

router.post('/remove-favour', authenticateToken, (req, res) => {
    
});

router.get('/partner', authenticateToken, (req, res) => {

});

router.post('/verify-favour', (req, res) => {

});

module.exports = router;