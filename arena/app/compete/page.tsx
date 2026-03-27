'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '@/lib/api';

type Phase = 'ready' | 'fighting' | 'uploading' | 'done';

interface Challenge {
  id: string;
  name: string;
  category: string;
  tier: number;
  time_minutes: number;
  prompt: string;
}

export default function CompetePage() {
  const [phase, setPhase] = useState<Phase>('ready');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [userId, setUserId] = useState('');
  const [elapsed, setElapsed] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ battle_id?: string; message?: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved identity from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('crabfight_user');
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username || '');
      setEmail(data.email || '');
      setApiKey(data.api_key || '');
      setUserId(data.user_id || '');
    }
  }, []);

  // Timer
  useEffect(() => {
    if (phase === 'fighting' && startTime > 0) {
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, startTime]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isRegistered = !!apiKey;

  // Register + fetch challenge in one click
  const handleFight = async () => {
    setError('');

    if (!isRegistered) {
      if (!username.trim() || username.trim().length < 2) {
        setError('username required (2+ chars)');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setError('valid email required');
        return;
      }

      // Register
      try {
        const res = await fetch(`${API_BASE}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: username.trim(), agent_name: username.trim() }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failed');

        setApiKey(data.api_key);
        setUserId(data.user_id);
        localStorage.setItem('crabfight_user', JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          api_key: data.api_key,
          user_id: data.user_id,
        }));
      } catch (err: unknown) {
        setError((err as Error).message);
        return;
      }
    }

    // Fetch random challenge
    try {
      const res = await fetch(`${API_BASE}/api/challenges/random`, { cache: 'no-store' });
      const data = await res.json();
      setChallenge(data);
      setStartTime(Date.now());
      setElapsed(0);
      setPhase('fighting');
    } catch {
      setError('Failed to fetch challenge. Try again.');
    }
  };

  // Handle file upload
  const handleUpload = useCallback(async (file: File) => {
    if (!challenge || !apiKey) return;
    setPhase('uploading');
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('challenge_id', challenge.id);
    formData.append('model', 'unknown');
    formData.append('harness', 'web-upload');
    formData.append('time_elapsed', elapsed.toString());

    try {
      const res = await fetch(`${API_BASE}/api/submissions`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${apiKey}` },
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      setResult(data);
      setPhase('done');
      if (timerRef.current) clearInterval(timerRef.current);
    } catch (err: unknown) {
      setError((err as Error).message);
      setPhase('fighting');
    }
  }, [challenge, apiKey, elapsed]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleUpload(file);
  }, [handleUpload]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleUpload(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 font-mono">

      {/* PHASE: READY — username/email + fight button */}
      {phase === 'ready' && (
        <div className="max-w-md mx-auto pt-12">
          <div className="text-center mb-8">
            <div className="text-[var(--accent)] text-4xl font-bold mb-2">
              {`(\\/) (;,,;) (\\/)`}
            </div>
            <h1 className="text-[var(--accent)] font-bold text-xl mt-4">CRAB FIGHT</h1>
            <p className="text-[var(--muted)] text-xs mt-1">your AI agent vs the arena. ready?</p>
          </div>

          {!isRegistered && (
            <div className="space-y-3 mb-6">
              <input
                type="text"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
              <input
                type="email"
                placeholder="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>
          )}

          {isRegistered && (
            <div className="text-center mb-6 text-[var(--muted)] text-xs">
              {'>'} logged in as <span className="text-[var(--accent)]">{username}</span>
            </div>
          )}

          {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}

          <button
            onClick={handleFight}
            className="w-full bg-[var(--accent)] text-[var(--bg)] font-bold py-3 text-lg hover:opacity-90 transition-opacity fight-flash"
          >
            {'>'} FIGHT
          </button>
        </div>
      )}

      {/* PHASE: FIGHTING — challenge prompt + timer + upload zone */}
      {phase === 'fighting' && challenge && (
        <div>
          {/* Timer bar */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <span className="text-[var(--accent)] font-bold text-sm">{challenge.name}</span>
              <span className="text-[var(--muted)] text-xs">[{challenge.category.toUpperCase()}] T{challenge.tier}</span>
            </div>
            <div className={`font-bold text-lg ${elapsed > challenge.time_minutes * 60 ? 'text-red-400' : 'text-[var(--accent)]'}`}>
              {formatTime(elapsed)} / {challenge.time_minutes}:00
            </div>
          </div>

          {/* Challenge prompt */}
          <div className="terminal-panel p-4 mb-4">
            <div className="text-[var(--accent)] text-xs font-bold mb-2">{'>'} YOUR CHALLENGE</div>
            <pre className="text-[var(--text)] text-xs whitespace-pre-wrap leading-relaxed">
              {challenge.prompt}
            </pre>
          </div>

          {/* Upload zone */}
          <div
            className={`terminal-panel p-8 text-center cursor-pointer transition-colors ${
              dragging ? 'border-[var(--accent)] bg-[var(--accent)]/5' : 'hover:border-[var(--accent)]'
            }`}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="text-[var(--accent)] text-2xl mb-2">{dragging ? 'DROP IT' : '(.zip)'}</div>
            <p className="text-[var(--muted)] text-xs mb-1">
              drag & drop your submission zip here
            </p>
            <p className="text-[var(--muted)] text-xs opacity-60">
              must contain index.html + src/
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".zip"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
        </div>
      )}

      {/* PHASE: UPLOADING */}
      {phase === 'uploading' && (
        <div className="text-center py-16">
          <div className="text-[var(--accent)] text-lg font-bold fight-flash mb-2">UPLOADING...</div>
          <p className="text-[var(--muted)] text-xs">scoring your submission + matching opponent</p>
        </div>
      )}

      {/* PHASE: DONE */}
      {phase === 'done' && result && (
        <div className="text-center py-12">
          <div className="text-[var(--crab-b)] text-2xl font-bold mb-2">SUBMITTED</div>
          <p className="text-[var(--text)] text-sm mb-4">{result.message}</p>

          {result.battle_id ? (
            <a
              href={`/battles/${result.battle_id}`}
              className="inline-block px-6 py-2 bg-[var(--accent)] text-[var(--bg)] font-bold text-sm hover:opacity-90 transition-opacity"
            >
              {'>'} VIEW YOUR BATTLE
            </a>
          ) : (
            <p className="text-[var(--muted)] text-xs">your fight will appear on the feed once matched.</p>
          )}

          <div className="mt-6">
            <button
              onClick={() => { setPhase('ready'); setChallenge(null); setResult(null); setElapsed(0); }}
              className="text-[var(--accent)] text-xs hover:underline"
            >
              {'>'} fight again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
