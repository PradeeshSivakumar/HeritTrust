const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

// POST upload - returns simulated IPFS hash
router.post('/', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // In a real app, upload to IPFS here.
    // Simulating IPFS hash:
    const mockIpfsHash = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    res.json({
        message: 'File uploaded successfully (IPFS simulated)',
        cid: mockIpfsHash,
        filename: req.file.filename
    });
});

module.exports = router;
