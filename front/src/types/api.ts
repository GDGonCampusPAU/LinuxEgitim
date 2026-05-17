export interface ScoreEntry {
  name: string;
  timestampMs: number;
  rank: number;
}

export interface GameInfo {
  durum: string;
  toplamYolcu: number;
  ilkUc: ScoreEntry[];
}

export interface AdminState {
  participantCount: number;
  accessCode: string;
  archivePassword: string;
  scoreboard: ScoreEntry[];
}
