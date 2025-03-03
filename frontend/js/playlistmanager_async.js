async function getPlaylists() {
    try {
        let response = await fetch('/api/playlists/');
        let playlists = await response.json();
        return playlists;
    } catch (error) {
        console.error('Error fetching playlists:', error);
        return [];
    }
}

async function deletePlaylist(id, name) {
    try {
        let pl_url = `/api/playlists/${id}`;
        let resp = await fetch(pl_url, {
            method: 'Delete',
            headers: {
                "Content-type": "application/json"
            }
        });
        document.getElementById('deleted').textContent = `${name} deleted!`;
    } catch (error) {
        console.error('Error deleting playlist:', error);
    }
}

async function getSongs() {
    try {
        let response = await fetch('/api/songs/');
        let songs = await response.json();
        return songs;
    } catch (error) {
        console.error('Error fetching songs:', error);
        return [];
    }
}

async function getSongsInPlaylist(id) {
    try {
        let pl_url = `/api/playlists/${id}`;
        let response = await fetch(pl_url);
        let data = await response.json();
        return data.songs || [];
    } catch (error) {
        console.error('Error fetching songs in playlist:', error);
        return [];
    }
}

function initPlaylistSelector(selectedPlaylistIndex = 0) {
    let playlistSelector = document.getElementById('playlistSelector');
    if (!playlistSelector) {
        playlistSelector = document.createElement('select');
        playlistSelector.setAttribute('id', 'playlistSelector');
        playlistElements.prepend(playlistSelector);
    }

    playlistSelector.innerHTML = '';
    playlistArray.forEach((playlist, index) => {
        let option = document.createElement('option');
        option.value = index;
        option.innerText = playlist.name;
        option.selected = index === selectedPlaylistIndex;
        playlistSelector.appendChild(option);
    });

    return playlistSelector;
}

async function saveEditedPlaylist(songs, id, name) {
    try {
        let pl_url = `/api/playlists/${id}`;
        let resp = await fetch(pl_url, {
            method: 'PUT',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify({
                songs: songs,
                name: name
            })
        });
        
        return await resp.json();
    } catch (error) {
        console.error('Error saving edited playlist:', error);
    }
}

async function savePlaylist(playlist) {
    try {
        let url = '/api/playlists/';
        let resp = await fetch(url, {
            method: 'POST',
            headers: {
                "Content-type": "application/json"
            },
            body: JSON.stringify(playlist)
        });

        let added_playlist = await resp.json();
        
        document.getElementById('listText').innerHTML = `${added_playlist.name} playlist saved with ID: ${added_playlist.id}`;
        document.getElementById('currentList').innerHTML = "";
        
        return added_playlist;
    } catch (error) {
        console.error('Error saving playlist:', error);
    }
}

async function initNewPlaylist() {
    workingPlaylist = [];
    temp.innerHTML = '';

    let add = document.createElement('button');
    add.setAttribute('id', 'add');
    add.textContent = "Add Selected Song";

    let save = document.createElement('button');
    save.setAttribute('id', 'save');
    save.textContent = "Save Playlist";

    let text_input = document.createElement('input');
    text_input.setAttribute('type', 'input');
    text_input.size = 40;
    let inputText = document.createElement('p');
    inputText.textContent = "Playlist Name:";

    let songObjects = await getSongs();

    let songText = document.createElement('label');
    songText.setAttribute('for', 'songs');
    songText.textContent = "Select a song to add to the playlist:";

    let songs = document.createElement('select');
    songs.name = 'songs';
    songs.id = 'songs';
    songs.size = songObjects.length;

    for(let j = 0; j < songObjects.length; j++) {
        let option = document.createElement('option');
        option.value = songObjects[j].songName;
        option.textContent = songObjects[j].songName;

        songs.appendChild(option);
    }

    let listText = document.createElement('p');
    listText.id = 'listText';
    listText.textContent = "Songs in Playlist:";
    let ol = document.createElement('ol');
    ol.id = 'currentList';

    add.addEventListener('click', () => {
        let songIndex = songs.selectedIndex;
        workingPlaylist.push(songObjects[songIndex]);
        let li = document.createElement('li');
        li.textContent = songObjects[songIndex].songName;
        ol.appendChild(li);
    });

    save.addEventListener('click', async () => {
        let playlist = {};
        playlist.name = text_input.value;
        playlist.songs = workingPlaylist;
        
        await savePlaylist(playlist);
        workingPlaylist = [];
        text_input.value = '';
    });

    temp.appendChild(inputText);
    temp.appendChild(text_input);
    temp.appendChild(songText);
    temp.appendChild(songs);
    temp.appendChild(add);
    temp.appendChild(save);
    temp.appendChild(listText);
    temp.appendChild(ol);
}