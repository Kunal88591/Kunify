'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import './admin.css';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function sanitizeFileName(name) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^\w\-\.]+/g, '');
}

export default function AdminPage() {
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    if (!file) {
      setMessage('❌ Please select a music file to upload.');
      return;
    }
    if (!title.trim() || !artist.trim()) {
      setMessage('❌ Please enter title and artist.');
      return;
    }

    try {
      const sanitizedFileName = sanitizeFileName(file.name);
      const filePath = `placeholder/${Date.now()}_${sanitizedFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('music')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setMessage('❌ Failed to upload file.');
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from('music').getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('placeholder_songs').insert([
        {
          title: title.trim(),
          artist: artist.trim(),
          audio_url: publicUrl,
          file_path: filePath,
        }
      ]);

      if (insertError) {
        console.error('Insert error:', insertError);
        setMessage('❌ Failed to add song to placeholder table.');
        return;
      }

      setTitle('');
      setArtist('');
      setFile(null);
      setMessage('✅ Placeholder song uploaded and added!');
    } catch (error) {
      console.error('Unexpected error:', error);
      setMessage('❌ Something went wrong.');
    }
  };

  return (
    <div className="admin-page">
      <h1 className="admin-title">Upload Placeholder Song</h1>
      <form className="admin-form" onSubmit={handleSubmit}>
        <input
          className="admin-input"
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          className="admin-input"
          type="text"
          placeholder="Artist"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          required
        />
        <input
          className="admin-input"
          type="file"
          accept="audio/*"
          onChange={handleFileChange}
          required
        />
        <button type="submit" className="admin-button">Upload & Add Placeholder</button>
      </form>
      {message && <p className="admin-message">{message}</p>}
    </div>
  );
}
