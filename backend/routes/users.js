const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Get User Role
router.get('/:address', async (req, res) => {
    try {
        const user = await User.findOne({ walletAddress: req.params.address });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Register/Update User
router.post('/', async (req, res) => {
    try {
        let user = await User.findOne({ walletAddress: req.body.walletAddress });
        if (!user) {
            user = new User({
                walletAddress: req.body.walletAddress,
                role: req.body.role || 'citizen',
                name: req.body.name
            });
            await user.save();
        }
        res.json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
