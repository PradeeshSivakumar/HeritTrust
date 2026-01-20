const mongoose = require('mongoose');

const MilestoneSchema = new mongoose.Schema({
    id: Number, // Corresponds to Smart Contract Milestone ID
    description: String,
    proofHash: String, // IPFS Hash
    verificationScore: Number,
    aiAnalysis: Object // Store full AI JSON result
});

const ProjectSchema = new mongoose.Schema({
    contractId: Number, // ID from Smart Contract
    name: String,
    description: String,
    contractorAddress: String,
    location: {
        lat: Number,
        lng: Number
    },
    milestones: [MilestoneSchema],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', ProjectSchema);
