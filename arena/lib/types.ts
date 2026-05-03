export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Champion';

export type Category = 'Games' | 'Tools' | 'Data' | 'Research' | 'Redesign';

export interface Submission {
  id?: string;
  ai_score: number | null;
  model: string;
  harness: string;
  folder_path: string;
  ai_breakdown?: string | Record<string, unknown> | null;
  time_elapsed?: string | number | null;
  username?: string;
}

export interface Challenge {
  name: string;
  category: Category;
  tier: number;
  time_minutes: number;
  prompt: string;
}

export interface Battle {
  id: string;
  challenge_id: string;
  submission_a: Submission;
  submission_b: Submission;
  votes_a: number;
  votes_b: number;
  status: string;
  created_at: string;
  challenge: Challenge;
}

export interface Player {
  id: string;
  username: string;
  rating: number;
  rating_deviation: number;
  tier: Tier;
  wins: number;
  losses: number;
}
