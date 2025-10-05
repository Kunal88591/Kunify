'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

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
    favorites: [],
    activeView: 'home',
  });

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const favs = localStorage.getItem('kunify_favorites');
      if (favs) {
        setPlayerState(prev => ({ ...prev, favorites: JSON.parse(favs) }));
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kunify_favorites', JSON.stringify(playerState.favorites));
    }
  }, [playerState.favorites]);
  // Set active view for sidebar navigation
  const setActiveView = useCallback((view) => {
    setPlayerState((prev) => ({ ...prev, activeView: view }));
  }, []);
  // Add/remove favorite
  const toggleFavorite = useCallback((song) => {
    setPlayerState((prev) => {
      const isFav = prev.favorites.some((s) => s.id === song.id);
      return {
        ...prev,
        favorites: isFav
          ? prev.favorites.filter((s) => s.id !== song.id)
          : [...prev.favorites, song],
      };
    });
  }, []);

  const updatePlayerState = useCallback((updates) => {
    setPlayerState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setCurrentSong = useCallback((song) => {
    setPlayerState((prev) => ({
      ...prev,
      currentSong: song,
      isPlaying: true,
    }));
  }, []);

  const setIsPlaying = useCallback((isPlaying) => {
    setPlayerState((prev) => ({
      ...prev,
      isPlaying,
    }));
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        ...playerState,
        updatePlayerState,
        setCurrentSong,
        setIsPlaying,
        toggleFavorite,
        setActiveView,
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
