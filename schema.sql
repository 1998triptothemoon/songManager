CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    song_name VARCHAR(255) NOT NULL,
    performing_artist VARCHAR(255),
    tuning VARCHAR(50),
    capo_fret INTEGER,
    relative_key VARCHAR(50),
    actual_key VARCHAR(50),
    song_data TEXT
);

CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE playlist_songs (
    playlist_id INTEGER REFERENCES playlists(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    position INTEGER NOT NULL,
    PRIMARY KEY (playlist_id, song_id)
);