'use client';

import React, { useEffect, useState } from 'react';
import './Sidebar.css';
import { usePlayer } from '@/context/PlayerContext';

const Sidebar = () => {
  const { activeView, setActiveView } = usePlayer();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsMounted(true);
    }
  }, []);

  const navItems = [
    { id: 'home', icon: 'fa-home', label: 'Home' },
    { id: 'search', icon: 'fa-search', label: 'Search' },
    { id: 'library', icon: 'fa-music', label: 'Your Library' },
    { id: 'favorites', icon: 'fa-heart', label: 'Favorites' },
    { id: 'playlists', icon: 'fa-list', label: 'Playlists' },
  ];

  const handleNavigation = (view) => {
    if (!isMounted) return;
    setActiveView(view);
    // Disabled routing logic intentionally
  };

  if (!isMounted) {
    return (
      <aside className="sidebar" role="navigation" aria-label="Main Navigation">
        <div className="sidebar-skeleton">
          <div className="skeleton-logo"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton-nav-item"></div>
          ))}
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar" role="navigation" aria-label="Main Navigation">
      {/* Logo */}
      <div className="sidebar-brand">
        <h1 className="logo" onClick={() => handleNavigation('home')}>
          <i className="fas fa-headphones-alt" aria-hidden="true"></i>
          <span>Kunify</span>
        </h1>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">
        {navItems.slice(0, 2).map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeView === item.id ? 'active' : ''}`}
            onClick={() => handleNavigation(item.id)}
            aria-current={activeView === item.id ? 'page' : undefined}
          >
            <i className={`fas ${item.icon}`} aria-hidden="true"></i>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Library Section */}
      <section className="library-section" aria-label="Your Library">
        <div className="library-header">
          <button
            className={`nav-item ${activeView === 'library' ? 'active' : ''}`}
            onClick={() => handleNavigation('library')}
          >
            <i className="fas fa-music" aria-hidden="true"></i>
            <span>Your Library</span>
          </button>
          <button className="create-playlist-btn" disabled>
            <i className="fas fa-plus"></i>
          </button>
        </div>

        <div className="library-filters">
          <button
            className={`filter-btn ${activeView === 'playlists' ? 'active' : ''}`}
            onClick={() => handleNavigation('playlists')}
          >
            Playlists
          </button>
          <button
            className={`filter-btn ${activeView === 'favorites' ? 'active' : ''}`}
            onClick={() => handleNavigation('favorites')}
          >
            Favorites
          </button>
        </div>

        <div className="recent-playlists">
          <h3 className="section-title">Recent Playlists</h3>
          <ul className="playlist-list">
            {['Workout Mix', 'Chill Vibes', 'Focus Flow', 'Road Trip'].map((playlist) => (
              <li key={playlist}>
                <button
                  className="playlist-item"
                  onClick={() => handleNavigation('playlist')}
                >
                  <span>{playlist}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* User Profile */}
      <div className="user-profile">
        <div className="profile-avatar">
          <img src="/media/default-cover.jpg" alt="User profile" />
        </div>
        <div className="profile-info">
          <span className="profile-name">User Name</span>
          <button className="profile-settings" onClick={() => handleNavigation('settings')}>
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
