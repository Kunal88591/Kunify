'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import './MainContent.css';

const MainContent = () => {
  const {
    songs = [],
    currentSong,
    updatePlayerState
  } = usePlayer();
  
  const [isMounted, setIsMounted] = useState(false);
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [localSongs, setLocalSongs] = useState(songs);

  // Fetch songs
  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/songs?limit=100');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      const loadedSongs = Array.isArray(result?.data) ? result.data : [];
      setLocalSongs(loadedSongs);
      updatePlayerState({ songs: loadedSongs });
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      setLocalSongs([]);
      updatePlayerState({ songs: [] });
    } finally {
      setIsLoading(false);
    }
  }, [updatePlayerState]);

  // Upload handler
  const handleFileUpload = useCallback(async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        if (!response.ok) throw new Error('Upload failed');
        return await response.json();
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean).map(r => r.data);
      
      if (successfulUploads.length > 0) {
        const updatedSongs = [...successfulUploads, ...localSongs];
        setLocalSongs(updatedSongs);
        updatePlayerState({ songs: updatedSongs });
      }
    } catch (error) {
      console.error('Upload error:', error);
    }
  }, [localSongs, updatePlayerState]);

  // Delete handler
  const handleDeleteSong = useCallback(async (songId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this song?')) return;

    try {
      const response = await fetch(`/api/delete/${songId}`, {
        method: 'DELETE',
      });
      
      if (response.status === 204) {
        const updatedSongs = localSongs.filter(song => song.id !== songId);
        setLocalSongs(updatedSongs);
        updatePlayerState({ 
          songs: updatedSongs,
          currentSong: currentSong?.id === songId ? null : currentSong
        });
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  }, [localSongs, updatePlayerState, currentSong]);

  // Handle click on song card
  const handleSongClick = useCallback((song) => {
    if (!isMounted) return;
    updatePlayerState({ currentSong: song, isPlaying: true });

    // router.push(`/song/${song.id}`); // temporarily disabled
  }, [isMounted, updatePlayerState]);

  const filteredSongs = useMemo(() => 
    localSongs.filter(song => 
      song?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song?.artist?.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    [localSongs, searchQuery]
  );

  const sortedSongs = useMemo(() => {
    return [...filteredSongs].sort((a, b) => {
      if (sortOption === 'recent') {
        return new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0);
      }
      if (sortOption === 'title') {
        return (a?.title || '').localeCompare(b?.title || '');
      }
      if (sortOption === 'artist') {
        return (a?.artist || '').localeCompare(b?.artist || '');
      }
      return 0;
    });
  }, [filteredSongs, sortOption]);

  useEffect(() => {
    setIsMounted(true);
    fetchSongs();
  }, [fetchSongs]);

  if (!isMounted) {
    return (
      <div className="main-content-wrapper">
        <div className="main-content">
          <div className="content-header-skeleton">
            <div className="skeleton-title"></div>
            <div className="skeleton-search"></div>
            <div className="skeleton-sort"></div>
            <div className="skeleton-upload"></div>
          </div>
          <div className="songs-grid-skeleton">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="song-card-skeleton">
                <div className="skeleton-album-art"></div>
                <div className="skeleton-song-info"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-wrapper">
      <div className="main-content">
        <div className="content-header">
          <h1 className="page-title">Your Music Library</h1>

          <div className="action-bar">
            <div className="search-container">
              <i className="fas fa-search search-icon"></i>
              <input
                type="text"
                placeholder="Search songs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
                aria-label="Search songs"
              />
            </div>

            <div className="sort-container">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
                aria-label="Sort songs"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
              </select>
            </div>

            <button
              onClick={() => fileInputRef.current.click()}
              className="upload-btn"
              aria-label="Add songs"
            >
              <i className="fas fa-plus"></i> Add Songs
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={handleFileUpload}
                hidden
                multiple
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Loading your music...</p>
          </div>
        ) : sortedSongs.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-music empty-icon"></i>
            <h3>No songs found</h3>
            <p>{searchQuery ? 'Try a different search' : 'Upload some music to get started'}</p>
            <button
              onClick={() => fileInputRef.current.click()}
              className="upload-btn empty-btn"
              aria-label="Upload first song"
            >
              <i className="fas fa-upload"></i> Upload Your First Song
            </button>
          </div>
        ) : (
          <div className="songs-grid">
            {sortedSongs.map(song => (
              <div
                key={song.id}
                className={`song-card ${currentSong?.id === song.id ? 'active' : ''}`}
                onClick={() => handleSongClick(song)}
                aria-label={`Play ${song.title}`}
              >
                <div className="album-art-container">
                  <img
                    src={song.cover || '/default_cover.jpg'}
                    alt={`Album cover for ${song.title}`}
                    className="album-art"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/default_cover.jpg';
                    }}
                  />
                  <div className="card-overlay">
                    <button
                      className="play-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        updatePlayerState({ currentSong: song, isPlaying: true });

                      }}
                      aria-label={currentSong?.id === song.id ? 'Pause' : 'Play'}
                    >
                      <i className={`fas ${currentSong?.id === song.id ? 'fa-pause' : 'fa-play'}`}></i>
                    </button>
                  </div>
                </div>
                <div className="song-info">
                  <h3 className="song-title" title={song.title}>{song.title}</h3>
                  <p className="song-artist" title={song.artist || 'Unknown Artist'}>
                    {song.artist || 'Unknown Artist'}
                  </p>
                  <div className="song-meta">
                    <span className="song-duration">{song.duration || '--:--'}</span>
                    <button
                      className="delete-btn"
                      onClick={(e) => handleDeleteSong(song.id, e)}
                      aria-label="Delete song"
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainContent;
