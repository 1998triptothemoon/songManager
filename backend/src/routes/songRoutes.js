const express = require('express');
const router = express.Router();
const songController = require('../controllers/songController');

// Get all songs
router.get('/', songController.getAllSongs);

// Get a specific song
router.get('/:id', songController.getSongById);

// Create a new song
router.post('/', songController.createSong);

// Delete a song
router.delete('/:id', songController.deleteSong);

module.exports = router;