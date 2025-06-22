import React, { useState, useRef, useEffect } from 'react';

const MusicPlayer = ({ currentSong }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const audioRef = useRef(null);

  useEffect(() => {
    if (currentSong && audioRef.current && currentSong.public_url) {
      audioRef.current.src = currentSong.public_url;
      audioRef.current.load();
  
      audioRef.current.onerror = (e) => {
        console.error('Audio error:', e.target.error, currentSong.public_url);
      };
  
      setIsPlaying(false);
      setCurrentTime(0);
    }
  }, [currentSong]);
  

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current
        .play()
        .catch((error) => console.error('Playback failed:', error));
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current?.currentTime || 0);
    setDuration(audioRef.current?.duration || 0);
  };

  const handleSeek = (e) => {
    const time = Number(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
    setCurrentTime(time);
  };

  const handleVolumeChange = (e) => {
    const newVolume = Number(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume / 100;
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '00:00';
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="music-player">
      <div className="album">
        <img
          src="/media/default_cover.jpg"
          alt="Cover"
          style={{ height: '3.5rem', borderRadius: '0.5rem' }}
        />
        <div className="album-text">
          <p>{currentSong ? currentSong.title : 'No song selected'}</p>
          <p>{currentSong ? currentSong.artist || 'Unknown Artist' : 'Unknown Artist'}</p>
        </div>
      </div>

      <div className="player">
        <audio
          ref={audioRef}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onError={(e) => console.error('Audio error:', e?.target?.error || 'Unknown error')}
        />
        <div className="player-controls">
          <img src="/media/player_icon1.png" className="player-control-icon" alt="Previous" />
          <img src="/media/player_icon2.png" className="player-control-icon" alt="Next" />
          <img
            src={isPlaying ? "/media/pause_icon3.png" : "/media/player_icon3.png"}
            className="player-control-icon"
            style={{ opacity: 1, height: '2rem' }}
            onClick={togglePlay}
            alt={isPlaying ? "Pause" : "Play"}
          />
          <img src="/media/player_icon4.png" className="player-control-icon" alt="Shuffle" />
          <i className="fa-solid fa-headset"></i>
        </div>
        <div className="playback-bar">
          <span className="curr-time">{formatTime(currentTime)}</span>
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            className="progress-bar"
            onChange={handleSeek}
          />
          <span className="tot-time">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="advanced-controls">
        <div className="play-icon-container">
          <i className="fa-solid fa-play play-icon"></i>
          <div className="green-dot"></div>
        </div>
        <i className="fa-solid fa-microphone"></i>
        <i className="fa-solid fa-bars"></i>
        <i className="fa-solid fa-tablet-screen-button"></i>
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          className="volume-slider"
          onChange={handleVolumeChange}
        />
        <i className="fa-solid fa-display"></i>
      </div>
    </div>
  );
};

export default MusicPlayer;
