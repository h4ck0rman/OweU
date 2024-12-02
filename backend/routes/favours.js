const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Favour = require('../models/Favour');
const mongoose = require('mongoose');
require('dotenv').config(); 

// set up the prisma client for database interactions
const router = express.Router();

// Middleware for json request bodies 
router.use(express.json());

router.get('/', authenticateToken, async(req, res) => {
    try {
        const userID = req.user;
        const favours = await Favour.find({user: userID});

        res.status(200).json(favours);

    } catch (error) {
        console.log(`Get Favours For User Error: ${error}`);
        res.status(500).json({message: 'Fetching Favours ran into unexpected errors.'});
    }
});

router.get('/:id', authenticateToken, async(req, res) => {
    // Retrieve id from request parameter
    const { id } = req.params; 
    const userID = req.user;

    console.log(id);
    try {
        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Find favour based on id 
        // TODO: check userid is included in either user or partner
        const favour = await Favour.find({
            _id: id, 
            $or: [{ user: userID }, { partner: userID }],
        });

        // Return the favour in response
        res.status(200).json(favour);

    } catch (error) {
        // 
        console.log(`Finding Favour Error: ${error}`);
        res.status(500).json({message: 'Server ran into unexpected errors.'});
    }
});

router.post('/add-favour', authenticateToken, async(req, res) => {
    try {
        // get user from token 
        const user = req.user;

        // fetch all values from the post body 
        const { partner, startTime, endTime, title } = req.body;

        // If partner or title values are missing return error message
        if (!partner || !title) {
            res.status(400).json({message: "Partner and Title are required!"})
        }

        // Prevent self-assignment
        if (partner === user) {
            return res.status(400).json({ message: 'You cannot assign a favour to yourself' });
        }

        // create a new favour object with all the above details
        const favour = new Favour({
            user,
            partner,
            title,
            startTime,
            status: 'pending',
            endTime,
        });

        // save the details to mongodb
        await favour.save();

        res.status(201).json(favour);

    } catch (error) {
        console.log(`Add Favours Error: ${error}`);
        res.status(500).json({message: 'Adding Favours ran into unexpected errors.'});
    }
});

router.post('/edit-favour/:id', authenticateToken, async(req, res) => {
    
});

router.post('/remove-favour', authenticateToken, (req, res) => {
    
});

router.post('/verify-favour', (req, res) => {

});

module.exports = router;