const express = require('express');
const router = express.Router();
const playlistController = require('../controllers/playlistController');

// Get all playlists
router.get('/', playlistController.getAllPlaylists);

// Get a specific playlist with its songs
router.get('/:id', playlistController.getPlaylistById);

// Create a new playlist
router.post('/', playlistController.createPlaylist);

// Update a playlist
router.put('/:id', playlistController.updatePlaylist);

// Delete a playlist
router.delete('/:id', playlistController.deletePlaylist);

module.exports = router;