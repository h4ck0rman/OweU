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

/**
 * @route GET /
 * @desc Retrieve all favours for the authenticated user
 * @access Protected (requires authentication)
 * @returns {object} 200 - List of favours where the user is either the creator or the partner
 * @returns {object} 500 - Internal server error
 */
router.get('/', authenticateToken, async (req, res) => {
    try {
        const user = req.user; // Extract authenticated user's ObjectId from token

        // Fetch favours where the user is either the creator or the partner
        const favours = await Favour.find({
            $or: [
                { user: user }, // Favour where the user is the creator
                { partner: user }, // Favour where the user is the partner
            ],
        });

        // Respond with the list of favours
        res.status(200).json({ success: true, favours });
    } catch (error) {
        // Log unexpected errors securely for debugging purposes
        console.error(`Get Favours For User Error: ${error.message}`);

        // Respond with a 500 Internal Server Error
        res.status(500).json({ message: 'Server ran into unexpected errors.' });
    }
});


/**
 * @route GET /:id
 * @desc Fetch a single favour by its ID
 * @access Protected (requires authentication)
 * @param {string} id - The MongoDB ObjectId of the favour to retrieve
 */
router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params; // Retrieve the ID from request parameters
    const user = req.user; // Retrieve the authenticated user's ObjectId

    try {
        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Query the database for the favour
        const favour = await Favour.findOne({
            _id: id,
            $or: [
                { user: user }, // Match if the user is the creator
                { partner: user }, // Match if the user is the partner
            ],
        });

        // If no favour is found, return a 404 Not Found error
        if (!favour) {
            return res.status(404).json({ message: 'Favour not found or unauthorized access' });
        }

        // Respond with the favour details
        res.status(200).json({ message: 'Favour found successfully!', favour });
    } catch (error) {
        // Log the error securely for debugging
        console.error(`Finding Favour Error: ${error.message}`);

        // Return a 500 Internal Server Error response
        res.status(500).json({ message: 'Server ran into unexpected errors.' });
    }
});

/**
 * @route POST /add-favour
 * @desc Create a new favour record
 * @access Protected (requires authentication)
 * @body {string} partner - The ObjectId of the partner (required)
 * @body {Date} startTime - The start time of the favour (optional, defaults to current time)
 * @body {Date} endTime - The end time of the favour (must be after startTime)
 * @body {string} title - The title of the favour (required, max length 50)
 */
router.post('/add-favour', authenticateToken, async (req, res) => {
    const { partner, startTime, endTime, title } = req.body;
    const user = req.user; // Extract the authenticated user's ID from the token

    try {
        // Validate required fields
        if (!partner) {
            return res.status(400).json({ message: 'Partner ID is required' });
        }

        if (!title) {
            return res.status(400).json({ message: 'Title is required' });
        }

        if (title.length > 50) {
            return res.status(400).json({ message: 'Title must not exceed 50 characters' });
        }

        if (endTime && new Date(endTime) <= new Date(startTime || Date.now())) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Check if the partner ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(partner)) {
            return res.status(400).json({ message: 'Invalid partner ID format' });
        }

        // Prevent self-assignment of favours
        if (partner === user) {
            return res.status(400).json({ message: 'You cannot assign a favour to yourself' });
        }

        // Create a new Favour record
        const newFavour = new Favour({
            user: user,
            partner,
            startTime: startTime || Date.now(),
            endTime,
            title,
        });

        // Save the new favour to the database
        const savedFavour = await newFavour.save();

        // Respond with the created favour
        res.status(201).json({ message: 'Favour created successfully', favour: savedFavour });
    } catch (error) {
        // Log unexpected errors
        console.error(`Add Favour Error: ${error.message}`);

        // Respond with a 500 Internal Server Error
        res.status(500).json({ message: 'Server ran into unexpected errors.' });
    }
});


/**
 * @route POST /:id/update-favour
 * @desc Update an existing favour record
 * @access Protected (requires authentication)
 * @param {string} id - The MongoDB ObjectId of the favour to update
 * @body {Date} startTime - The updated start time of the favour (optional)
 * @body {Date} endTime - The updated end time of the favour (optional, must be after startTime)
 * @body {string} title - The updated title of the favour (optional, max length 50)
 * @body {string} status - The updated status of the favour (optional, must be a valid enum value)
 */
router.post('/:id/update-favour', authenticateToken, async (req, res) => {
    const { id } = req.params; // Extract the ID from the request parameters
    const user = req.user; // Extract the authenticated user's ObjectId
    const { startTime, endTime, title, status } = req.body; // Extract fields to update from the request body

    try {
        // Validate the ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Query the favour and ensure the user is authorized to update it
        const favour = await Favour.findOne({
            _id: id,
            $or: [
                { user: user }, // Check if the user is the creator
                { partner: user }, // Check if the user is the partner
            ],
        });

        // If no favour is found, return a 404 Not Found error
        if (!favour) {
            return res.status(404).json({ message: 'Favour not found or unauthorized access' });
        }

        // Validate the status if provided
        const validStatuses = ['verified', 'rejected']; // Allowed statuses
        if (status && !validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }

        // Validate the title length if provided
        if (title && title.length > 50) {
            return res.status(400).json({ message: 'Title must not exceed 50 characters' });
        }

        // Validate the end time if provided
        if (endTime && new Date(endTime) <= new Date(startTime || favour.startTime)) {
            return res.status(400).json({ message: 'End time must be after start time' });
        }

        // Update the favour fields only if they are provided
        if (startTime) favour.startTime = new Date(startTime);
        if (endTime) favour.endTime = new Date(endTime);
        if (title) favour.title = title;
        if (status) favour.status = status;

        // Save the updated favour to the database
        const updatedFavour = await favour.save();

        // Respond with the updated favour
        res.status(200).json({ message: 'Favour updated successfully', favour: updatedFavour });
    } catch (error) {
        // Log unexpected errors
        console.error(`Update Favour Error: ${error.message}`);

        // Respond with a 500 Internal Server Error
        res.status(500).json({ message: 'Server ran into unexpected errors.' });
    }
});


/**
 * @route GET /:id/remove-favour
 * @desc Delete a favour by its ID
 * @access Protected (requires authentication)
 * @param {string} id - The MongoDB ObjectId of the favour to delete
 */
router.get('/:id/remove-favour', authenticateToken, async(req, res) => {
    const { id } = req.params; // Retrieve the ID from request parameters
    const user = req.user; // Retrieve the authenticated user's ID

    try {
        // Validate the `id` to ensure it is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid ID format' });
        }

        // Find the favour by ID and ensure the user is authorized to delete it
        const deletedFavour = await Favour.findOneAndDelete({
            _id: id,
            user: user, // Ensure the authenticated user is the creator
        });

        // If no favour is found, return a 404 Not Found error
        if (!deletedFavour) {
            return res.status(404).json({ message: 'Favour not found or unauthorized access' });
        }

        // Respond with a success message
        res.status(200).json({ message: 'Favour deleted successfully' });

    } catch (error) {
        // Log any unexpected errors that occur during execution
        console.log(`Delete Favour Error: ${error.message}`);

        // Respond with a 500 Internal Server Error to indicate a server-side issue
        res.status(500).json({ message: 'Server ran into unexpected errors.' });
    }
});


module.exports = router;