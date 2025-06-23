'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import MusicPlayer from '@/components/MusicPlayer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {
  return (
    <main className="main-layout">
      <Sidebar />
      <MainContent />
      <MusicPlayer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </main>
  );
}
