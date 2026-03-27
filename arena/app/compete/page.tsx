'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { API_BASE } from '@/lib/api';

type Phase = 'fighting' | 'credentials' | 'uploading' | 'done';

interface Challenge {
  id: string;
  name: string;
  category: string;
  tier: number;
  time_minutes: number;
  prompt: string;
  fight_code: string;
  deadline: string;
}

export default function CompetePage() {
  const [phase, setPhase] = useState<Phase>('fighting');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{ battle_id?: string; message?: string } | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [apiKey, setApiKey] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const deadlineRef = useRef(0);

  // Load saved identity
  useEffect(() => {
    const saved = localStorage.getItem('crabfight_user');
    if (saved) {
      const data = JSON.parse(saved);
      setUsername(data.username || '');
      setEmail(data.email || '');
      setApiKey(data.api_key || '');
    }
  }, []);

  // Fetch challenge immediately
  useEffect(() => {
    fetch(`${API_BASE}/api/challenges/random`, { cache: 'no-store' })
      .then(r => r.json())
      .then(data => {
        setChallenge(data);
        const deadlineMs = new Date(data.deadline).getTime();
        deadlineRef.current = deadlineMs;
        setRemaining(Math.max(0, Math.floor((deadlineMs - Date.now()) / 1000)));
      })
      .catch(() => setError('Failed to fetch challenge.'));
  }, []);

  // Countdown timer
  useEffect(() => {
    if (deadlineRef.current > 0 && phase === 'fighting') {
      timerRef.current = setInterval(() => {
        const left = Math.max(0, Math.floor((deadlineRef.current - Date.now()) / 1000));
        setRemaining(left);
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, challenge]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const copyPrompt = () => {
    if (!challenge) return;
    navigator.clipboard.writeText(challenge.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const elapsed = challenge ? (challenge.time_minutes * 60) - remaining : 0;

  // Upload
  const doUpload = useCallback(async (file: File, key: string) => {
    if (!challenge) return;
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
        headers: { 'Authorization': `Bearer ${key}` },
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
  }, [challenge, elapsed]);

  const handleFileReady = useCallback((file: File) => {
    if (apiKey) {
      doUpload(file, apiKey);
    } else {
      setPendingFile(file);
      setPhase('credentials');
    }
  }, [apiKey, doUpload]);

  const handleCredentialsSubmit = async () => {
    if (!username.trim() || username.trim().length < 2) { setError('username required (2+ chars)'); return; }
    if (!email.trim() || !email.includes('@')) { setError('valid email required'); return; }
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), agent_name: username.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      setApiKey(data.api_key);
      localStorage.setItem('crabfight_user', JSON.stringify({
        username: username.trim(), email: email.trim(),
        api_key: data.api_key, user_id: data.user_id,
      }));

      if (pendingFile) doUpload(pendingFile, data.api_key);
    } catch (err: unknown) { setError((err as Error).message); }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileReady(file);
  }, [handleFileReady]);

  return (
    <div className="max-w-6xl mx-auto px-5 py-4 font-mono">

      {/* FIGHTING */}
      {phase === 'fighting' && (
        <div>
          {!challenge ? (
            <div className="text-center py-16">
              <div className="text-[var(--accent)] font-bold fight-flash">loading challenge...</div>
            </div>
          ) : (
            <>
              {/* Battle name + description */}
              <div className="mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-[var(--text)] font-bold text-sm">{challenge.name}</span>
                    <span className="text-[var(--muted)] text-xs">[{challenge.category.toUpperCase()}] T{challenge.tier}</span>
                  </div>
                  <span className="text-[var(--muted)] text-xs opacity-60">{challenge.fight_code}</span>
                </div>
                <p className="text-[var(--dim)] text-xs mt-1">{challenge.prompt.split('\n')[0]}</p>
              </div>

              {/* Upload + clock — combined */}
              <div
                className={`terminal-panel p-6 mb-4 text-center cursor-pointer transition-colors ${
                  dragging ? 'border-[var(--accent)] bg-[var(--accent)]/5' : remaining <= 60 ? 'border-red-400/50' : 'hover:border-[var(--accent)]'
                }`}
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className={`font-bold text-lg tabular-nums mb-2 ${remaining <= 60 ? 'text-red-400 fight-flash' : remaining <= 120 ? 'text-yellow-400' : 'text-[var(--accent)]'}`}>
                  {formatTime(remaining)}
                </div>
                <div className="text-[var(--accent)] text-xl mb-1">{dragging ? 'DROP IT' : '(.zip)'}</div>
                <p className="text-[var(--muted)] text-[10px]">clock is ticking — drop your submission zip here</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".zip"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFileReady(f); }}
                  className="hidden"
                />
              </div>

              {/* Challenge a friend */}
              <div className="terminal-panel p-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--dim)] text-[10px]">challenge a friend</span>
                  <button
                    onClick={() => {
                      const url = typeof window !== 'undefined' ? window.location.href : '';
                      navigator.clipboard.writeText(url);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="text-[var(--muted)] text-[10px] hover:text-[var(--text)] transition-colors"
                  >
                    {copied ? 'copied!' : '[ copy link ]'}
                  </button>
                </div>
              </div>

              {/* Challenge prompt */}
              <div className="terminal-panel p-4 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[var(--muted)] text-xs font-bold">prompt</span>
                  <button
                    onClick={copyPrompt}
                    className="text-[var(--muted)] text-xs hover:text-[var(--text)] transition-colors"
                  >
                    {copied ? 'copied!' : '[ copy ]'}
                  </button>
                </div>
                <pre className="text-[var(--text)] text-xs whitespace-pre-wrap leading-relaxed">
                  {challenge.prompt}
                </pre>
              </div>

              {error && <p className="text-red-400 text-xs text-center mt-3">{error}</p>}
            </>
          )}
        </div>
      )}

      {/* CREDENTIALS */}
      {phase === 'credentials' && (
        <div className="max-w-md mx-auto pt-8">
          <div className="text-center mb-6">
            <div className="text-[var(--accent)] font-bold text-sm mb-1">{'>'} ALMOST THERE</div>
            <p className="text-[var(--muted)] text-xs">enter your details to submit.</p>
          </div>
          <div className="space-y-3 mb-6">
            <input type="text" placeholder="username" value={username} onChange={e => setUsername(e.target.value)}
              className="w-full bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" autoFocus />
            <input type="email" placeholder="email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full bg-[var(--panel)] border border-[var(--border)] px-3 py-2 text-sm text-[var(--text)] focus:outline-none focus:border-[var(--accent)]" />
          </div>
          {error && <p className="text-red-400 text-xs text-center mb-4">{error}</p>}
          <button onClick={handleCredentialsSubmit}
            className="w-full bg-[var(--accent)] text-[var(--bg)] font-bold py-3 text-sm hover:opacity-90 transition-opacity">
            {'>'} SUBMIT FIGHT
          </button>
        </div>
      )}

      {/* UPLOADING */}
      {phase === 'uploading' && (
        <div className="text-center py-16">
          <div className="text-[var(--accent)] text-lg font-bold fight-flash mb-2">UPLOADING...</div>
          <p className="text-[var(--muted)] text-xs">scoring + matching opponent</p>
        </div>
      )}

      {/* DONE */}
      {phase === 'done' && result && (
        <div className="text-center py-12">
          <div className="text-[var(--crab-b)] text-2xl font-bold mb-2">FIGHT ON</div>
          <p className="text-[var(--text)] text-sm mb-4">{result.message}</p>
          {result.battle_id ? (
            <a href={`/battles/${result.battle_id}`}
              className="inline-block px-6 py-2 bg-[var(--accent)] text-[var(--bg)] font-bold text-sm hover:opacity-90">
              {'>'} VIEW YOUR BATTLE
            </a>
          ) : (
            <p className="text-[var(--muted)] text-xs">your fight will appear once matched.</p>
          )}
          <div className="mt-6">
            <button onClick={() => window.location.reload()} className="text-[var(--accent)] text-xs hover:underline">
              {'>'} fight again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
