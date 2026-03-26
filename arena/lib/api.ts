import { Battle, Player } from './types';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export { API_BASE };

// Normalize API response to handle both flat and nested shapes
function normalizeBattle(raw: Record<string, unknown>): Battle {
  // If already nested, return as-is
  if (raw.submission_a && typeof raw.submission_a === 'object') return raw as unknown as Battle;
  // Flat shape — restructure
  return {
    id: raw.id as string,
    challenge_id: raw.challenge_id as string,
    votes_a: raw.votes_a as number,
    votes_b: raw.votes_b as number,
    status: raw.status as string,
    created_at: raw.created_at as string,
    challenge: {
      name: (raw.challenge_name || 'Unknown') as string,
      category: (raw.category || '') as string,
      tier: raw.tier as number,
      time_minutes: raw.time_minutes as number,
      prompt: (raw.challenge_prompt || '') as string,
    },
    submission_a: {
      id: (raw.submission_a_id || raw.sub_a_id) as string,
      ai_score: (raw.score_a || 0) as number,
      ai_breakdown: raw.breakdown_a as Record<string, number> | null,
      model: (raw.model_a || '') as string,
      harness: (raw.harness_a || '') as string,
      folder_path: (raw.folder_a || '') as string,
      time_elapsed: (raw.time_a || '') as string,
      username: (raw.username_a || '') as string,
    },
    submission_b: {
      id: (raw.submission_b_id || raw.sub_b_id) as string,
      ai_score: (raw.score_b || 0) as number,
      ai_breakdown: raw.breakdown_b as Record<string, number> | null,
      model: (raw.model_b || '') as string,
      harness: (raw.harness_b || '') as string,
      folder_path: (raw.folder_b || '') as string,
      time_elapsed: (raw.time_b || '') as string,
      username: (raw.username_b || '') as string,
    },
  } as Battle;
}

export async function fetchBattles(category?: string): Promise<Battle[]> {
  const params = new URLSearchParams();
  if (category && category !== 'All') {
    params.set('category', category);
  }
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/battles${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch battles: ${res.status}`);
  const data = await res.json();
  return (data as Record<string, unknown>[]).map(normalizeBattle);
}

export async function fetchBattle(id: string): Promise<Battle> {
  const res = await fetch(`${API_BASE}/api/battles/${id}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch battle: ${res.status}`);
  const data = await res.json();
  return normalizeBattle(data as Record<string, unknown>);
}

export async function fetchLeaderboard(harness?: string, model?: string): Promise<Player[]> {
  const params = new URLSearchParams();
  if (harness && harness !== 'All') params.set('harness', harness);
  if (model && model !== 'All') params.set('model', model);
  const qs = params.toString();
  const res = await fetch(`${API_BASE}/api/leaderboard${qs ? `?${qs}` : ''}`, {
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch leaderboard: ${res.status}`);
  return res.json();
}

export async function castVote(battleId: string, vote: 'A' | 'B'): Promise<void> {
  const res = await fetch(`${API_BASE}/api/battles/${battleId}/vote`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ voted_for: vote }),
  });
  if (!res.ok) throw new Error(`Failed to cast vote: ${res.status}`);
}

export async function fetchStats(): Promise<{ battles: number; players: number }> {
  try {
    const [battlesRes, leaderboardRes] = await Promise.all([
      fetch(`${API_BASE}/api/battles`, { cache: 'no-store' }),
      fetch(`${API_BASE}/api/leaderboard`, { cache: 'no-store' }),
    ]);
    const battles = battlesRes.ok ? await battlesRes.json() : [];
    const players = leaderboardRes.ok ? await leaderboardRes.json() : [];
    return {
      battles: Array.isArray(battles) ? battles.length : 0,
      players: Array.isArray(players) ? players.length : 0,
    };
  } catch {
    return { battles: 0, players: 0 };
  }
}
