const express = require('express');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config(); 

// set up the prisma client for database interactions
const prisma = new PrismaClient();
const router = express.Router();

// Middleware for json request bodies 
router.use(express.json());

router.post('/add-sesh', (req, res) => {

});

router.post('/edit-sesh', (req, res) => {
    
});

router.post('/remove-sesh', (req, res) => {
    
});

module.exports = router;