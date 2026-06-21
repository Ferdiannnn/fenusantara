'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [kingdomId, setKingdomId] = useState('');
  const [kingdoms, setKingdoms] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingKingdoms, setLoadingKingdoms] = useState(true);

  // Load kingdoms on mount
  useEffect(() => {
    fetch('/api/game/kingdoms')
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setKingdoms(res.data);
        } else {
          setError('Gagal memuat daftar kerajaan');
        }
      })
      .catch(err => {
        console.error(err);
        setError('Terjadi kesalahan koneksi saat memuat kerajaan');
      })
      .finally(() => {
        setLoadingKingdoms(false);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kingdomId) {
      setError('Silakan pilih kerajaan terlebih dahulu');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/game/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, kingdom_id: parseInt(kingdomId) })
      });
      const data = await res.json();

      if (data.status === 'success') {
        alert('Registrasi berhasil! Selamat datang, Panglima.');
        localStorage.setItem('player', JSON.stringify(data.data));
        router.push('/map');
      } else {
        setError(data.message || 'Registrasi gagal');
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
        <h2 className="auth-title">Registrasi Pemain</h2>
        
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
              placeholder="Masukkan username baru"
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
              placeholder="Buat password keamanan"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="auth-form-group">
            <label className="auth-label" htmlFor="kingdom">Pilih Kerajaan</label>
            <select 
              className="auth-select"
              id="kingdom" 
              required
              value={kingdomId}
              onChange={(e) => setKingdomId(e.target.value)}
              disabled={loading || loadingKingdoms}
            >
              {loadingKingdoms ? (
                <option value="">-- Sedang memuat kerajaan... --</option>
              ) : (
                <>
                  <option value="">-- Pilih Kerajaan --</option>
                  {kingdoms.map(k => (
                    <option key={k.id} value={k.id}>{k.name}</option>
                  ))}
                </>
              )}
            </select>
          </div>
          <button className="auth-button" type="submit" disabled={loading || loadingKingdoms}>
            {loading ? 'Mendaftarkan...' : 'Daftar & Bermain'}
          </button>
        </form>
        
        <div className="auth-footer">
          Sudah punya akun? <Link href="/login">Login di sini</Link>
        </div>
      </div>
    </div>
  );
}
