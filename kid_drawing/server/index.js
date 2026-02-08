const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const drawingsRoutes = require('./routes/drawings');
const usersRoutes = require('./routes/users');
const imagesRoutes = require('./routes/images');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/drawings', drawingsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/images', imagesRoutes);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});