const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Load users data
const usersDataPath = path.join(__dirname, '../data/users.json');
let users = JSON.parse(fs.readFileSync(usersDataPath, 'utf8'));

// Get all users
router.get('/', (req, res) => {
    res.json(users);
});

// Get user by ID
router.get('/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');
    res.json(user);
});

// Create a new user
router.post('/', (req, res) => {
    const newUser = {
        id: users.length + 1,
        ...req.body
    };
    users.push(newUser);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));
    res.status(201).json(newUser);
});

// Update user by ID
router.put('/:id', (req, res) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    if (!user) return res.status(404).send('User not found');

    Object.assign(user, req.body);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));
    res.json(user);
});

// Delete user by ID
router.delete('/:id', (req, res) => {
    const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
    if (userIndex === -1) return res.status(404).send('User not found');

    const deletedUser = users.splice(userIndex, 1);
    fs.writeFileSync(usersDataPath, JSON.stringify(users, null, 2));
    res.json(deletedUser);
});

module.exports = router;