const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticateToken } = require('../middleware/auth');
require('dotenv').config(); 

// set up the prisma client for database interactions
const prisma = new PrismaClient();
const router = express.Router();

// Middleware for json request bodies 
router.use(express.json());

router.get('/add-sesh', authenticateToken, (req, res) => {
    res.json({message: "Hello"});
});

router.post('/edit-sesh', (req, res) => {
    
});

router.post('/remove-sesh', (req, res) => {
    
});

module.exports = router;