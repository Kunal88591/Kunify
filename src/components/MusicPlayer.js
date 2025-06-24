'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import './MusicPlayer.css';
import { usePlayer } from '@/context/PlayerContext';

const MusicPlayer = () => {
  const {
    currentSong,
    songs,
    isPlaying,
    volume,
    isMuted,
    isRepeat,
    isShuffle,
    updatePlayerState
  } = usePlayer();

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [lyrics, setLyrics] = useState('');

  const audioRef = useRef(null);

  const fetchLyrics = async (songId) => {
    try {
      const res = await fetch(`/api/lyrics/${songId}`);
      const data = await res.json();
      setLyrics(data.lyrics || 'No lyrics available');
    } catch {
      setLyrics('Lyrics could not be loaded.');
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    const loadSong = async () => {
      try {
        audio.src = currentSong.public_url || currentSong.audio_url;
        await audio.load();
        setCurrentTime(0);
        setDuration(0);

        fetchLyrics(currentSong.id);

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => updatePlayerState({ isPlaying: true }))
            .catch(err => {
              updatePlayerState({ isPlaying: false });
              console.warn('Autoplay prevented:', err);
            });
        }
      } catch (error) {
        console.error('Error loading song:', error);
      }
    };

    loadSong();
  }, [currentSong, updatePlayerState]);

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration || 0);
  };

  const handleSeek = (e) => {
    const { left, width } = e.target.getBoundingClientRect();
    const clickX = e.clientX - left;
    const newTime = (clickX / width) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    try {
      if (isPlaying) {
        await audio.pause();
      } else {
        await audio.play();
      }
      updatePlayerState({ isPlaying: !isPlaying });
    } catch (err) {
      console.error('Toggle play error:', err);
    }
  };

  const skipForward = () => (audioRef.current.currentTime += 10);
  const skipBackward = () => (audioRef.current.currentTime -= 10);

  const toggleMute = () => {
    const audio = audioRef.current;
    audio.muted = !isMuted;
    updatePlayerState({ isMuted: !isMuted });
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    audioRef.current.volume = newVolume;
    updatePlayerState({ volume: newVolume, isMuted: newVolume === 0 });
  };

  const toggleRepeat = () => {
    audioRef.current.loop = !isRepeat;
    updatePlayerState({ isRepeat: !isRepeat });
  };

  const toggleShuffle = () => updatePlayerState({ isShuffle: !isShuffle });
  const toggleLyrics = () => setShowLyrics(!showLyrics);

  const playNextSong = useCallback(() => {
    if (!songs.length) return;
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * songs.length)
      : (currentIndex + 1) % songs.length;
    updatePlayerState({ currentSong: songs[nextIndex] });
  }, [songs, currentSong, isShuffle, updatePlayerState]);

  const playPreviousSong = useCallback(() => {
    if (!songs.length) return;
    if (currentTime > 3) {
      audioRef.current.currentTime = 0;
      return;
    }
    const currentIndex = songs.findIndex(s => s.id === currentSong?.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    updatePlayerState({ currentSong: songs[prevIndex] });
  }, [songs, currentSong, currentTime, updatePlayerState]);

  useEffect(() => {
    const handler = (e) => {
      if (['Space', 'ArrowRight', 'ArrowLeft', 'KeyM', 'KeyL'].includes(e.code)) e.preventDefault();
      switch (e.code) {
        case 'Space': togglePlay(); break;
        case 'ArrowRight': skipForward(); break;
        case 'ArrowLeft': skipBackward(); break;
        case 'KeyM': toggleMute(); break;
        case 'KeyL': toggleLyrics(); break;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [togglePlay, skipForward, skipBackward, toggleMute, toggleLyrics]);

  return (
    <div className={`music-player ${!currentSong ? 'hidden' : ''}`}>
      <audio
        ref={audioRef}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNextSong}
        onTimeUpdate={() => setCurrentTime(audioRef.current.currentTime)}
      />

      <div className="player-top-section">
        <div className="now-playing">
          <div className={`album-art ${isPlaying ? 'rotate' : ''}`}>
            <img
              src={currentSong?.cover || '/default_cover.jpg'}
              alt="Album art"
              loading="lazy"
            />
          </div>
          <div className="song-info">
            <h3>{currentSong?.title || 'No song selected'}</h3>
            <p>{currentSong?.artist || 'Unknown Artist'}</p>
          </div>
        </div>

        {showLyrics && (
          <div className="lyrics-container">
            <h4>Lyrics</h4>
            <div className="lyrics-content">
              {lyrics.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="player-controls">
        <div className="progress-container" onClick={handleSeek}>
          <div 
            className="progress-bar , progress-thumb"
            style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
          />
          <span className="time-display">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>

        <div className="control-group">
          <button onClick={toggleShuffle} className={`control-btn ${isShuffle ? 'active' : ''}`}>
            <i className="fas fa-random" />
          </button>
          <button onClick={playPreviousSong} className="control-btn">
            <i className="fas fa-backward" />
          </button>
          <button onClick={togglePlay} className="play-btn">
            <i className={`fas fa-${isPlaying ? 'pause' : 'play'}`} />
          </button>
          <button onClick={playNextSong} className="control-btn">
            <i className="fas fa-forward" />
          </button>
          <button onClick={toggleRepeat} className={`control-btn ${isRepeat ? 'active' : ''}`}>
            <i className="fas fa-redo" />
          </button>
        </div>

        <div className="control-group">
          <button onClick={toggleLyrics} className="control-btn">
            <i className="fas fa-music" />
          </button>
          <div className="volume-control">
            <button onClick={toggleMute} className="control-btn">
              <i className={`fas fa-volume-${isMuted ? 'mute' : volume > 0.5 ? 'up' : 'down'}`} />
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="volume-slider"
            />
          </div>
          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`control-btn ${showPlaylist ? 'active' : ''}`}
          >
            <i className="fas fa-bars" />
          </button>
        </div>
      </div>

      {showPlaylist && (
        <div className="playlist-drawer">
          <h4>Playlist ({songs.length})</h4>
          <div className="playlist-songs">
            {songs.map((song) => (
              <div
                key={song.id}
                className={`playlist-item ${currentSong?.id === song.id ? 'active' : ''}`}
                onClick={() => updatePlayerState({ currentSong: song, isPlaying: true })}
              >
                <img src={song.cover || '/default_cover.jpg'} alt={song.title} />
                <div className="playlist-info">
                  <h5>{song.title}</h5>
                  <p>{song.artist || 'Unknown Artist'}</p>
                </div>
                <span>{formatTime(song.duration)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const formatTime = (seconds) => {
  if (isNaN(seconds)) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default MusicPlayer;
