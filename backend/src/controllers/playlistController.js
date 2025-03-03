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

// Get all playlists
const getAllPlaylists = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM playlists ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting playlists:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get a specific playlist with all its songs
const getPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // First get the playlist
    const playlistResult = await db.query('SELECT * FROM playlists WHERE id = $1', [id]);
    
    if (playlistResult.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    const playlist = playlistResult.rows[0];
    
    // Then get all songs in the playlist
    const songsResult = await db.query(
      `SELECT s.*, ps.position 
       FROM songs s
       JOIN playlist_songs ps ON s.id = ps.song_id
       WHERE ps.playlist_id = $1
       ORDER BY ps.position`,
      [id]
    );
    
    // Transform the songs to camelCase
    const songs = songsResult.rows.map(toCamelCase);
    
    // Return the playlist with its songs
    res.json({
      id: playlist.id,
      name: playlist.name,
      songs: songs
    });
  } catch (error) {
    console.error('Error getting playlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new playlist
const createPlaylist = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { name, songs } = req.body;
    
    // Create the playlist
    const playlistResult = await client.query(
      'INSERT INTO playlists (name) VALUES ($1) RETURNING *',
      [name]
    );
    
    const newPlaylist = playlistResult.rows[0];
    
    // Add songs to the playlist if provided
    if (songs && songs.length > 0) {
      for (let i = 0; i < songs.length; i++) {
        await client.query(
          'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES ($1, $2, $3)',
          [newPlaylist.id, songs[i].id, i]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Get the complete playlist with songs to return
    const result = await getPlaylistWithSongs(newPlaylist.id);
    res.status(201).json(result);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error creating playlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Update a playlist
const updatePlaylist = async (req, res) => {
  const client = await db.pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { name, songs } = req.body;
    
    // Check if playlist exists
    const checkResult = await client.query('SELECT * FROM playlists WHERE id = $1', [id]);
    
    if (checkResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    // Update playlist name if provided
    if (name) {
      await client.query('UPDATE playlists SET name = $1 WHERE id = $2', [name, id]);
    }
    
    // Update songs if provided
    if (songs) {
      // Remove existing playlist songs
      await client.query('DELETE FROM playlist_songs WHERE playlist_id = $1', [id]);
      
      // Add new songs
      for (let i = 0; i < songs.length; i++) {
        await client.query(
          'INSERT INTO playlist_songs (playlist_id, song_id, position) VALUES ($1, $2, $3)',
          [id, songs[i].id, i]
        );
      }
    }
    
    await client.query('COMMIT');
    
    // Get updated playlist to return
    const updatedPlaylist = await getPlaylistById(req, res);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error updating playlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

// Delete a playlist
const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM playlists WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Helper function to get a playlist with its songs
const getPlaylistWithSongs = async (playlistId) => {
  const playlistResult = await db.query('SELECT * FROM playlists WHERE id = $1', [playlistId]);
  const playlist = playlistResult.rows[0];
  
  const songsResult = await db.query(
    `SELECT s.*, ps.position 
     FROM songs s
     JOIN playlist_songs ps ON s.id = ps.song_id
     WHERE ps.playlist_id = $1
     ORDER BY ps.position`,
    [playlistId]
  );
  
  return {
    id: playlist.id,
    name: playlist.name,
    songs: songsResult.rows.map(toCamelCase)
  };
};

module.exports = {
  getAllPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist
};