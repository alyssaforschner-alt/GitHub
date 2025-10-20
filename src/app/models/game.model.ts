export type GameStatus =
  | 'UNKNOWN'
  | 'NOT_FOUND'
  | 'INVITED'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'GAME_ON'
  | 'GAME_OVER'
  | 'DRAW';

export interface Game {
  gameID: number;
  user1ID: number;
  user2ID: number;
  guessesUser1?: string | null;
  guessesUser2?: string | null;
  guessCount1: number;
  guessCount2: number;
  winnerUserID?: number | null;
  status?: GameStatus | null;
  guessWord?: string | null;
}

