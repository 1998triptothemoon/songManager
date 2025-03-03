const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const songRoutes = require('./routes/songRoutes');
const playlistRoutes = require('./routes/playlistRoutes');
const db = require('./db/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api/songs', songRoutes);
app.use('/api/playlists', playlistRoutes);

// Home route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Song API' });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT} and accessible to other computers`);
});