'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/game/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (data.status === 'success') {
        localStorage.setItem('player', JSON.stringify(data.data));
        router.push('/map');
      } else {
        setError(data.message || 'Login gagal');
      }
    } catch (err) {
      console.error(err);
      setError('Terjadi kesalahan koneksi sistem');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <h2 className="auth-title">Login Panglima</h2>
        
        {error && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#f87171',
            padding: '10px',
            borderRadius: '6px',
            fontSize: '0.85rem',
            marginBottom: '15px',
            textAlign: 'left'
          }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="username">Username</label>
            <input 
              className="auth-input"
              type="text" 
              id="username" 
              required 
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="password">Password</label>
            <input 
              className="auth-input"
              type="password" 
              id="password" 
              required 
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <button className="auth-button" type="submit" disabled={loading}>
            {loading ? 'Menghubungkan...' : 'Masuk Ke Medan Perang'}
          </button>
        </form>
        
        <div className="auth-footer">
          Belum punya kerajaan? <Link href="/register">Daftar sekarang</Link>
        </div>
      </div>
    </div>
  );
}
