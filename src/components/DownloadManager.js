'use client';

import React, { useState, useEffect, useCallback } from 'react';
import './DownloadManager.css';

const DownloadManager = () => {
  const [downloadedSongs, setDownloadedSongs] = useState([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState({});

  // Load downloaded songs from IndexedDB on component mount
  useEffect(() => {
    loadDownloadedSongs();
  }, []);

  const loadDownloadedSongs = useCallback(async () => {
    try {
      const songs = await getOfflineSongs();
      setDownloadedSongs(songs);
    } catch (error) {
      console.error('Failed to load downloaded songs:', error);
    }
  }, []);

  const downloadSong = useCallback(async (song) => {
    if (!navigator.onLine) {
      alert('You need to be online to download songs');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(prev => ({ ...prev, [song.id]: 0 }));

    try {
      // Check if song is already downloaded
      const isAlreadyDownloaded = downloadedSongs.some(s => s.id === song.id);
      if (isAlreadyDownloaded) {
        alert('This song is already downloaded');
        return;
      }

      // Download the audio file
      const response = await fetch(song.audio_url || song.public_url);
      if (!response.ok) throw new Error('Failed to download audio file');

      const audioBlob = await response.blob();
      
      // Store in IndexedDB
      await storeOfflineSong(song, audioBlob);
      
      // Update local state
      setDownloadedSongs(prev => [...prev, { ...song, isOffline: true }]);
      
      // Notify service worker to cache the file
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(registration => {
          registration.active.postMessage({
            type: 'CACHE_AUDIO',
            url: song.audio_url || song.public_url,
            songData: song
          });
        });
      }

      alert('Song downloaded successfully!');
    } catch (error) {
      console.error('Download failed:', error);
      alert('Failed to download song. Please try again.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[song.id];
        return newProgress;
      });
    }
  }, [downloadedSongs]);

  const removeDownloadedSong = useCallback(async (songId) => {
    try {
      await removeOfflineSong(songId);
      setDownloadedSongs(prev => prev.filter(song => song.id !== songId));
      alert('Song removed from offline storage');
    } catch (error) {
      console.error('Failed to remove song:', error);
      alert('Failed to remove song');
    }
  }, []);

  const getOfflineSongUrl = useCallback(async (song) => {
    try {
      const offlineUrl = await getOfflineSongBlob(song.id);
      return offlineUrl;
    } catch (error) {
      console.error('Failed to get offline song URL:', error);
      return song.audio_url || song.public_url;
    }
  }, []);

  const clearAllDownloads = useCallback(async () => {
    if (window.confirm('Are you sure you want to remove all downloaded songs?')) {
      try {
        await clearAllOfflineSongs();
        setDownloadedSongs([]);
        alert('All downloaded songs removed');
      } catch (error) {
        console.error('Failed to clear downloads:', error);
        alert('Failed to clear downloads');
      }
    }
  }, []);

  return (
    <div className="download-manager">
      <div className="download-header">
        <h3>Offline Downloads</h3>
        <div className="download-stats">
          <span>{downloadedSongs.length} songs downloaded</span>
          {downloadedSongs.length > 0 && (
            <button 
              className="clear-all-btn"
              onClick={clearAllDownloads}
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {downloadedSongs.length === 0 ? (
        <div className="no-downloads">
          <i className="fas fa-download"></i>
          <p>No songs downloaded yet</p>
          <small>Download songs to listen offline</small>
        </div>
      ) : (
        <div className="downloaded-songs">
          {downloadedSongs.map(song => (
            <div key={song.id} className="downloaded-song">
              <div className="song-info">
                <img 
                  src={song.cover || '/default_cover.jpg'} 
                  alt={song.title}
                  className="song-cover"
                />
                <div className="song-details">
                  <h4>{song.title}</h4>
                  <p>{song.artist || 'Unknown Artist'}</p>
                  <span className="offline-badge">
                    <i className="fas fa-download"></i>
                    Offline
                  </span>
                </div>
              </div>
              <div className="song-actions">
                <button
                  className="remove-btn"
                  onClick={() => removeDownloadedSong(song.id)}
                  title="Remove from offline storage"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// IndexedDB helper functions
const DB_NAME = 'KunifyOfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineSongs';

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        store.createIndex('title', 'title', { unique: false });
        store.createIndex('artist', 'artist', { unique: false });
      }
    };
  });
};

const storeOfflineSong = async (song, audioBlob) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  const offlineSong = {
    ...song,
    audioBlob: audioBlob,
    downloadedAt: new Date().toISOString(),
    isOffline: true
  };
  
  return new Promise((resolve, reject) => {
    const request = store.put(offlineSong);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getOfflineSongs = async () => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const getOfflineSongBlob = async (songId) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readonly');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.get(songId);
    request.onsuccess = () => {
      if (request.result && request.result.audioBlob) {
        const url = URL.createObjectURL(request.result.audioBlob);
        resolve(url);
      } else {
        reject(new Error('Song not found in offline storage'));
      }
    };
    request.onerror = () => reject(request.error);
  });
};

const removeOfflineSong = async (songId) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.delete(songId);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const clearAllOfflineSongs = async () => {
  const db = await openDB();
  const transaction = db.transaction([STORE_NAME], 'readwrite');
  const store = transaction.objectStore(STORE_NAME);
  
  return new Promise((resolve, reject) => {
    const request = store.clear();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export default DownloadManager;
