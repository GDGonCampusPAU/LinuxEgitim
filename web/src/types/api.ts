export interface ScoreEntry {
  name: string;
  timestampMs: number;
  rank: number;
}

export interface GameInfo {
  status: string;
  totalParticipants: number;
  topThree: ScoreEntry[];
}

export interface AdminState {
  participantCount: number;
  accessCode: string;
  archivePassword: string;
  scoreboard: ScoreEntry[];
}
