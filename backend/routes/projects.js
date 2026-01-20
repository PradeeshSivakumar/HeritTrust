const express = require('express');
const router = express.Router();
const Project = require('../models/Project');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const projects = await Project.find();
        res.json(projects);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// POST new project metadata (called after Smart Contract creation)
router.post('/', async (req, res) => {
    const project = new Project({
        contractId: req.body.contractId,
        name: req.body.name,
        description: req.body.description,
        contractorAddress: req.body.contractorAddress,
        location: req.body.location
    });

    try {
        const newProject = await project.save();
        res.status(201).json(newProject);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
