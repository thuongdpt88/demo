const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load drawings data
const drawingsDataPath = path.join(__dirname, '../data/drawings.json');
let drawings = JSON.parse(fs.readFileSync(drawingsDataPath, 'utf8'));

// Get all drawings
router.get('/', (req, res) => {
    res.json(drawings);
});

// Get a specific drawing by ID
router.get('/:id', (req, res) => {
    const drawing = drawings.find(d => d.id === parseInt(req.params.id));
    if (!drawing) return res.status(404).send('Drawing not found');
    res.json(drawing);
});

// Create a new drawing
router.post('/', (req, res) => {
    const newDrawing = {
        id: drawings.length + 1,
        title: req.body.title,
        image: req.body.image,
        userId: req.body.userId,
        rating: 0
    };
    drawings.push(newDrawing);
    fs.writeFileSync(drawingsDataPath, JSON.stringify(drawings, null, 2));
    res.status(201).json(newDrawing);
});

// Update a drawing
router.put('/:id', (req, res) => {
    const drawing = drawings.find(d => d.id === parseInt(req.params.id));
    if (!drawing) return res.status(404).send('Drawing not found');

    drawing.title = req.body.title || drawing.title;
    drawing.image = req.body.image || drawing.image;
    drawing.rating = req.body.rating || drawing.rating;

    fs.writeFileSync(drawingsDataPath, JSON.stringify(drawings, null, 2));
    res.json(drawing);
});

// Delete a drawing
router.delete('/:id', (req, res) => {
    const drawingIndex = drawings.findIndex(d => d.id === parseInt(req.params.id));
    if (drawingIndex === -1) return res.status(404).send('Drawing not found');

    drawings.splice(drawingIndex, 1);
    fs.writeFileSync(drawingsDataPath, JSON.stringify(drawings, null, 2));
    res.status(204).send();
});

module.exports = router;