const db = require('../db/db');

// Helper function to transform snake_case database field names to camelCase
const toCamelCase = (song) => {
  return {
    id: song.id,
    songName: song.song_name,
    performingArtist: song.performing_artist,
    tuning: song.tuning,
    capoFret: song.capo_fret,
    relativeKey: song.relative_key,
    actualKey: song.actual_key,
    songData: song.song_data
  };
};

// Get all songs
const getAllSongs = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM songs ORDER BY song_name');
    const songs = result.rows.map(toCamelCase);
    res.json(songs);
  } catch (error) {
    console.error('Error getting songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific song by ID
const getSongById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('SELECT * FROM songs WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    const song = toCamelCase(result.rows[0]);
    res.json(song);
  } catch (error) {
    console.error('Error getting song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new song
const createSong = async (req, res) => {
  try {
    const { songName, performingArtist, tuning, capoFret, relativeKey, actualKey, songData } = req.body;
    
    const result = await db.query(
      'INSERT INTO songs (song_name, performing_artist, tuning, capo_fret, relative_key, actual_key, song_data) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [songName, performingArtist, tuning, capoFret, relativeKey, actualKey, songData]
    );
    
    const newSong = toCamelCase(result.rows[0]);
    res.status(201).json(newSong);
  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a song
const deleteSong = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM songs WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Song not found' });
    }
    
    res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllSongs,
  getSongById,
  createSong,
  deleteSong
};