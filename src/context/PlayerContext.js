'use client';

import { createContext, useContext, useState, useCallback } from 'react';

export const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const [playerState, setPlayerState] = useState({
    songs: [],
    currentSong: null,
    isPlaying: false,
    volume: 0.7,
    isMuted: false,
    isRepeat: false,
    isShuffle: false,
  });

  const updatePlayerState = useCallback((updates) => {
    setPlayerState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setCurrentSong = useCallback((song) => {
    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      isPlaying: true // auto-play on song click
    }));
  }, []);

  const setIsPlaying = useCallback((isPlaying) => {
    setPlayerState(prev => ({
      ...prev,
      isPlaying
    }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...playerState,
        updatePlayerState,
        setCurrentSong,
        setIsPlaying
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within PlayerProvider');
  }
  return context;
};
