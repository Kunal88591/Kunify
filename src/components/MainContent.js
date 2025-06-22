import React, { useState, useEffect, useRef } from 'react';



const MainContent = ({ setCurrentSong, setSongs, songs, currentSong }) => {
  const fileInputRef = useRef(null);

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs?limit=100');
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setSongs(Array.isArray(result.data) ? result.data : []);
      } else {
        throw new Error(result.error || 'Unknown API error');
      }
    } catch (error) {
      console.error('Error fetching songs:', error);
      setSongs([]);
      // Optional: Show error to user
      // alert(`Failed to load songs: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchSongs();
  }, []);

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setSongs(prev => [result.data, ...(Array.isArray(prev) ? prev : [])]);
        }
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Optional: Show error to user
      // alert(`Upload failed: ${error.message}`);
    }
  };

  const handleDeleteSong = async (songId, e) => {
    e.stopPropagation(); // Prevent triggering song selection
    try {
      const response = await fetch(`/api/delete/${songId}`, {
        method: 'DELETE',
      });

      if (response.status === 204) {
        setSongs(prev => prev.filter(song => song.id !== songId));
        // If deleted song was playing, clear current song
        if (currentSong && currentSong.id === songId) {
          setCurrentSong(null);
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete song');
    }
  };

  return (
    <div className="main-content">
      <div className="sticky-nav">
        <div className="sticky-nav-icons">
          <img src="/media/backward_icon.png" alt="Back" />
          <img src="/media/forward_icon.png" alt="Forward" className="hide" />
        </div>
        <div className="sticky-nav-options">
          <button className="badge nav-item hide">Upgrade</button>
          <button className="badge nav-item dark-badge">
            <i className="fa-regular fa-circle-down" style={{ marginRight: '5px' }}></i>
            Install App
          </button>
          <i className="fa-regular fa-user"></i>
        </div>
      </div>

      <div style={{ margin: '1rem 0' }}>
        <button
          onClick={handleUploadClick}
          className="badge"
          style={{ background: '#1bd760', color: 'black' }}
        >
          <i className="fa-solid fa-upload"></i> Upload Song
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="audio/*"
          onChange={handleFileUpload}
        />
      </div>

      <h2>Your Uploaded Songs</h2>
      <div className="cards-container">
        {Array.isArray(songs) && songs.map((song) => (
          <div
            key={song.id}
            className="card"
            onClick={() => setCurrentSong(song)}
          >
            <img
              src="/media/default_cover.jpg"
              className="card-img"
              alt="Album Cover"
            />
            <div className="card-header">
              <p className="card-title">{song.title}</p>
              <button 
                className="delete-button"
                onClick={(e) => handleDeleteSong(song.id, e)}
              >
                <i className="fa-solid fa-trash"></i>
              </button>
            </div>
            <p className="card-info">{song.artist || 'Unknown Artist'}</p>
          </div>
        ))}
      </div>

      {/* Other sections (Recently Played, Trending, etc.) can go here */}
    </div>
  );
};

export default MainContent;
