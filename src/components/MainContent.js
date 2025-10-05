'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { usePlayer } from '@/context/PlayerContext';
import './MainContent.css';

const MainContent = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('recent');
  const [toastMessage, setToastMessage] = useState('');
  const [showPlaceholders, setShowPlaceholders] = useState(true);
  const fileInputRef = useRef(null);

  const { songs = [], currentSong, updatePlayerState, favorites = [], activeView } = usePlayer();
  const [localSongs, setLocalSongs] = useState(songs);

  const showToast = useCallback((message) => {
    setToastMessage(message);
    const timer = setTimeout(() => setToastMessage(''), 3000);
    return () => clearTimeout(timer);
  }, []);

  const fetchSongs = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/songs?limit=100');
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      const result = await response.json();
      const loadedSongs = Array.isArray(result?.data) ? result.data : [];
      setLocalSongs(loadedSongs);
      updatePlayerState({ songs: loadedSongs });
      showToast('🎵 Songs loaded successfully');
    } catch (error) {
      console.error('Failed to fetch songs:', error);
      showToast('❌ Failed to load songs');
      setLocalSongs([]);
      updatePlayerState({ songs: [] });
    } finally {
      setIsLoading(false);
    }
  }, [updatePlayerState, showToast]);

  const handleFileUpload = useCallback(async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    try {
      const uploadResults = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append('file', file);
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
          if (!response.ok) throw new Error(`Upload failed for ${file.name}`);
          return response.json();
        })
      );
      const successfulUploads = uploadResults.filter(Boolean).map(r => r.data);
      if (successfulUploads.length > 0) {
        const updatedSongs = [...successfulUploads, ...localSongs];
        setLocalSongs(updatedSongs);
        updatePlayerState({ songs: updatedSongs });
        showToast(`✅ ${successfulUploads.length} song(s) uploaded successfully!`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      showToast(`❌ Upload failed: ${error.message}`);
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }, [localSongs, updatePlayerState, showToast]);

  const handleDeleteSong = useCallback((songId, e) => {
    e.stopPropagation();
    showToast('⚠️ Only admin can delete songs.');
  }, [showToast]);

  const handleSongClick = useCallback((song) => {
    if (!isMounted) return;
    updatePlayerState({ 
      currentSong: song, 
      isPlaying: currentSong?.id !== song.id || !currentSong?.isPlaying 
    });
  }, [isMounted, updatePlayerState, currentSong]);

  const placeholderSongs = [
    {
      id: 'e8098784-06be-4413-8096-8db966354495',
      title: 'Kya Baat Ay',
      artist: 'Harrdy Sandhu',
      cover: 'card1.jpg',
      duration: '03:10',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750779378655_harrdy_sandhu_-_kya_baat_ay___jaani___b_praak___arvindr_khaira___official_music_videomp3_160k.mp3',
      isPlaceholder: true,
    },
    {
      id: '2ec95095-bb65-451a-be61-bfedd48a0505',
      title: 'NAAH',
      artist: 'Harrdy Sandhu',
      cover: 'card2.jpg',
      duration:'03:21',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750779409578_naah_-_harrdy_sandhu_feat._nora_fatehi___jaani___b_praak__official_music_video-latest_hit_song_2017mp3_160k.mp3',
      isPlaceholder: true,
    },
    {
      id: '418d3654-1898-4e52-b44b-d8b5163ab66c',
      title: 'HORNN Blow',
      artist: 'Harrdy Sandhu',
      cover: 'card4.jpg',
      duration:'02:45',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750779566844_hardy_sandhu__hornn_blow_video_song___jaani___b_praak___new_song_2016___t-seriesmp3_160k1.mp3',
      isPlaceholder: true,
    },
    {
      id: '700e8b0c-c1e6-4226-a349-548b60693762',
      title: 'BackBone',
      artist: 'Harrdy Sandhu',
      cover: 'card3.jpg',
      duration :'03:29',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750779613940_harrdy_sandhu_-_backbone___jaani___b_praak___zenith_sidhu___latest_romantic_song_2017mp3_160k1.mp3',
      isPlaceholder: true,
    },
      
    {
      id: '0a760a70-c4ee-4081-91e9-29d33a151e27',
      title: 'Milne hai mujhse aayi',
      artist: 'Arijit Singh',
      cover: 'card5.jpg',
      duration :'03:40',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750781328885______2__________.mp3',
      isPlaceholder: true,
    },

    {
      id: '4b7d376c-ff2e-43bc-a0e8-6ee88355c555',
      title: 'Chahun mein ya na',
      artist: 'Arijt Singh',
      cover: 'card6.jpg',
      duration :'04:00',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750781163502_________2_______.mp3',
      isPlaceholder: true,
    },

    {
      id: '87a20ca9-98bb-4a83-b323-366ca8e17800',
      title: 'Hum mar jayenge',
      artist: 'Tulsi Kumar',
      cover: 'card7.jpg',
      duration :'05:36',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750781366892_aashiqui_2_hum_mar_jayenge_full_video_song___aditya_roy_kapur_shraddha_kapoor.mp3',
      isPlaceholder: true,
    },

    {
      id: 'bca4c87a-cdc3-4de8-a683-267276286506',
      title: 'Tum hi hoo',
      artist: 'Arijit Singh',
      cover: 'card8.jpg',
      duration :'04:27',
      audio_url: 'https://mobnczvmkzecpkmyfcbs.supabase.co/storage/v1/object/public/music/placeholder/1750781100981_____2____________.mp3',
      isPlaceholder: true,
    },
  ];

  const allSongs = useMemo(() => [...localSongs, ...placeholderSongs], [localSongs]);
  const filteredSongs = useMemo(() => {
    if (!searchQuery) {
      return {
        placeholders: showPlaceholders ? placeholderSongs : [],
        uploads: localSongs
      };
    }
    const filtered = allSongs.filter(song =>
      song.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      song.artist?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return {
      placeholders: filtered.filter(song => song.isPlaceholder),
      uploads: filtered.filter(song => !song.isPlaceholder)
    };
  }, [searchQuery, allSongs, localSongs, showPlaceholders]);

  const sortedSongs = useMemo(() => {
    return [...filteredSongs.uploads].sort((a, b) => {
      if (sortOption === 'recent') return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      if (sortOption === 'title') return a.title.localeCompare(b.title);
      if (sortOption === 'artist') return a.artist.localeCompare(b.artist);
      return 0;
    });
  }, [filteredSongs.uploads, sortOption]);

  useEffect(() => {
    setIsMounted(true);
    fetchSongs();
    return () => setIsMounted(false);
  }, [fetchSongs]);

  if (!isMounted || isLoading) {
    return (
      <div className="main-content-wrapper">
        <div className="main-content">
          <div className="content-header-skeleton" />
          <div className="songs-grid-skeleton">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="song-card-skeleton" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content-wrapper">
      <div className="main-content">
        {toastMessage && <div className="toast-message">{toastMessage}</div>}
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
              />
            </div>
            <div className="sort-container">
              <label htmlFor="sort-select">Sort by:</label>
              <select
                id="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="sort-select"
              >
                <option value="recent">Recently Added</option>
                <option value="title">Title</option>
                <option value="artist">Artist</option>
              </select>
            </div>
            <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
              <i className="fas fa-plus"></i> Add Songs
              <input
                type="file"
                ref={fileInputRef}
                accept="audio/*"
                onChange={handleFileUpload}
                hidden
                multiple
              />
            </button>
          </div>
        </div>

        {/* Show only favorites if activeView is 'favorites' */}
        {activeView === 'favorites' ? (
          <div className="songs-section">
            <h2 className="section-heading">❤️ Your Favorite Songs</h2>
            {favorites.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>No favorites yet. Click the heart icon on any song to add it here!</div>
            ) : (
              <div className="songs-grid">
                {favorites.map(song => (
                  <SongCard
                    key={song.id}
                    song={song}
                    isActive={currentSong?.id === song.id}
                    onClick={handleSongClick}
                    updatePlayerState={updatePlayerState}
                    currentSong={currentSong}
                    isPlaceholder={false}
                  />
                ))}
              </div>
            )}
          </div>
        ) : searchQuery ? (
          <div className="songs-section">
            <h2 className="section-heading">🔍 Search Results</h2>
            <div className="songs-grid">
              {[...filteredSongs.placeholders, ...sortedSongs].map(song => (
                <SongCard
                  key={song.id}
                  song={song}
                  isActive={currentSong?.id === song.id}
                  onClick={handleSongClick}
                  onDelete={!song.isPlaceholder ? handleDeleteSong : null}
                  updatePlayerState={updatePlayerState}
                  currentSong={currentSong}
                  isPlaceholder={song.isPlaceholder}
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="songs-section">
              <div className="section-header">
                <h2 className="section-heading">🎧 Most Trending Tracks</h2>
                <button
                  className="toggle-placeholders"
                  onClick={() => setShowPlaceholders(!showPlaceholders)}
                >
                  <i className={`fas ${showPlaceholders ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  {showPlaceholders ? ' Hide Trending' : ' Show Trending'}
                </button>
              </div>
              {showPlaceholders && (
                <div className="songs-grid">
                  {placeholderSongs.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isActive={currentSong?.id === song.id}
                      onClick={handleSongClick}
                      updatePlayerState={updatePlayerState}
                      currentSong={currentSong}
                      isPlaceholder={true}
                    />
                  ))}
                </div>
              )}
            </div>

            {sortedSongs.length > 0 && (
              <div className="songs-section">
                <h2 className="section-heading">📁 Your Uploaded Songs</h2>
                <div className="songs-grid">
                  {sortedSongs.map(song => (
                    <SongCard
                      key={song.id}
                      song={song}
                      isActive={currentSong?.id === song.id}
                      onClick={handleSongClick}
                      onDelete={handleDeleteSong}
                      updatePlayerState={updatePlayerState}
                      currentSong={currentSong}
                      isPlaceholder={false}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

const SongCard = React.memo(({
  song,
  isActive = false,
  isPlaceholder = false,
  onClick = () => {},
  onDelete = null,
  updatePlayerState = null,
  currentSong = null,
}) => {
  return (
    <div
      className={`song-card ${isActive ? 'active' : ''} ${isPlaceholder ? 'placeholder' : ''}`}
      onClick={() => onClick(song)}
    >
      <div className="album-art-container">
        <img
          src={song.cover || '/default_cover.jpg'}
          alt={`Album cover for ${song.title}`}
          className="album-art"
          onError={(e) => { e.target.onerror = null; e.target.src = '/default_cover.jpg'; }}
        />
        <div className="card-overlay">
          <button
            className="play-btn"
            onClick={(e) => {
              e.stopPropagation();
              updatePlayerState({ currentSong: song, isPlaying: true });
            }}
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
          {!isPlaceholder && onDelete && (
            <button
              className="delete-btn"
              onClick={(e) => onDelete(song.id, e)}
            >
              <i className="fas fa-trash"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

SongCard.displayName = 'SongCard';

export default MainContent;
