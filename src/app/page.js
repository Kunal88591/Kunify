'use client';
import { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import MusicPlayer from '@/components/MusicPlayer';

export default function Home() {
  const [songs, setSongs] = useState([]);
  const [currentSong, setCurrentSong] = useState(null);

  return (
    <div className="main">
      <Sidebar />
      <MainContent 
        songs={songs} 
        setSongs={setSongs} 
        setCurrentSong={setCurrentSong} 
      />
      <MusicPlayer currentSong={currentSong} />
    </div>
  );
}
