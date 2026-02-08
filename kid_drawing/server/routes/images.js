const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load coloring templates
const coloringTemplatesPath = path.join(__dirname, '../data/coloring-templates.json');
let coloringTemplates = [];

// Load coloring templates from JSON file
fs.readFile(coloringTemplatesPath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading coloring templates:', err);
        return;
    }
    coloringTemplates = JSON.parse(data);
});

// Get all coloring templates
router.get('/', (req, res) => {
    res.json(coloringTemplates);
});

// Get a specific coloring template by ID
router.get('/:id', (req, res) => {
    const templateId = req.params.id;
    const template = coloringTemplates.find(t => t.id === templateId);
    if (template) {
        res.json(template);
    } else {
        res.status(404).send('Template not found');
    }
});

// Add a new coloring template (for future use)
router.post('/', (req, res) => {
    const newTemplate = req.body;
    coloringTemplates.push(newTemplate);
    fs.writeFile(coloringTemplatesPath, JSON.stringify(coloringTemplates, null, 2), (err) => {
        if (err) {
            console.error('Error saving new template:', err);
            return res.status(500).send('Error saving template');
        }
        res.status(201).json(newTemplate);
    });
});

// Export the router
module.exports = router;