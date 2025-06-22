import React from 'react';

const Sidebar = () => (
  <div className="sidebar">
    <div className="nav">
      <div className="nav-option" style={{ opacity: 1 }}>
        <i className="fa-solid fa-house"></i>
        <a href="#">Home</a>
      </div>
      <div className="nav-option">
        <i className="fa-solid fa-magnifying-glass"></i>
        <a href="#">Search</a>
      </div>
    </div>

    <div className="library">
      <div className="options">
        <div className="lib-option nav-option">
          <img src="/media/library_icon.png" alt="Library Icon" />
          <a href="#">Your Library</a>
        </div>
        <div className="icons">
          <i className="fa-solid fa-plus"></i>
          <i className="fa-solid fa-arrow-right"></i>
        </div>
      </div>

      <div className="lib-boxes">
        <div className="box">
          <p className="box-p1">Create your first playlist</p>
          <p className="box-p2">It's easy, we'll help you</p>
          <button className="badge">Create playlist</button>
        </div>
        <div className="box">
          <p className="box-p1">Let's find some podcast to follow</p>
          <p className="box-p2">We'll keep you updated on new episodes</p>
          <button className="badge">Browse podcasts</button>
        </div>
      </div>
    </div>
  </div>
);

export default Sidebar;
