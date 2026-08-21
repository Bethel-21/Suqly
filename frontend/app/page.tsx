'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setToken, setUser, getUser } from '../lib/api';

export default function HomePage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'OWNER' | 'CUSTOMER'>('CUSTOMER');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const body =
        mode === 'login'
          ? { phone, password }
          : { phone, password, name, role };
      const data = await api(`/auth/${mode}`, {
        method: 'POST',
        body: JSON.stringify(body),
      });
      setToken(data.access_token);
      setUser(data.user);
      router.push(data.user.role === 'OWNER' ? '/dashboard' : '/store');
    } catch (err: any) {
      setError(err.message);
    }
  }

  const existingUser = typeof window !== 'undefined' ? getUser() : null;

  return (
    <main>
      <h1>Suqly</h1>

      {existingUser && (
        <p>
          Already logged in as {existingUser.name} ({existingUser.role}).{' '}
          <a href={existingUser.role === 'OWNER' ? '/dashboard' : '/store'}>
            Go to your page
          </a>
        </p>
      )}

      <div style={{ marginBottom: 16 }}>
        <button onClick={() => setMode('login')} disabled={mode === 'login'}>
          Login
        </button>{' '}
        <button onClick={() => setMode('register')} disabled={mode === 'register'}>
          Register
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Phone</label>
          <br />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div>
          <label>Password</label>
          <br />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {mode === 'register' && (
          <>
            <div>
              <label>Name</label>
              <br />
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label>I am a...</label>
              <br />
              <select value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="CUSTOMER">Customer</option>
                <option value="OWNER">Business Owner</option>
              </select>
            </div>
          </>
        )}

        <br />
        <button type="submit">{mode === 'login' ? 'Login' : 'Register'}</button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </main>
  );
}
