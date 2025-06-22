import React, { useState, useEffect, useRef } from 'react';

const MainContent = ({ setCurrentSong, setSongs, songs }) => {
  const fileInputRef = useRef(null);

  // Fetch songs from API and set them as array
  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/songs');
      const data = await response.json();
      setSongs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching songs:', error);
      setSongs([]);
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
    console.log('Selected file:', file); // Debug
    
    if (!file || !file.type.startsWith('audio/')) {
      console.log('Invalid file or file type');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      console.log('Uploading file...');
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
  
      console.log('Upload response status:', response.status);
      
      if (response.ok) {
        const newSong = await response.json();
        console.log('New song received:', newSong);
        setSongs(prev => [newSong, ...(Array.isArray(prev) ? prev : [])]);
      } else {
        const errorData = await response.json();
        console.error('Upload failed:', errorData);
      }
    } catch (error) {
      console.error('Upload error:', error);
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

      {/* Upload Button */}
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
            <p className="card-title">{song.title}</p>
            <p className="card-info">{song.artist}</p>
          </div>
        ))}
      </div>

      {/* Other sections (Recently Played, Trending, etc.) */}
      <h2>Recently Played</h2>
      <div className="cards-container">
        <div className="card">
          <img src="/media/default_cover.jpg" />
          <p className="card-title">Top 50 - Global</p>
          <p className="card-info">Your daily updates of the most played ...</p>
        </div>
      </div>

      <h2>Trending now near you</h2>
      <div className="cards-container">
        {/* ... other cards ... */}
      </div>

      <div className="footer">
        <div className="line"></div>
      </div>
    </div>
  );
};

export default MainContent;
