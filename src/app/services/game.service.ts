import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../api.config';
import { Game } from '../models/game.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class GameService {
  private readonly http = inject(HttpClient);

  async startSingleGame(userID: number): Promise<Game> {
    const url = `${API_BASE}/games/start/singlegame`;
    const params = { userID: String(userID) };
    return await firstValueFrom(this.http.post<Game>(url, null, { params }));
  }

  // Multiplayer: send invitation to another user by username
  async invite(userID: number, username2: string): Promise<Game> {
    const url = `${API_BASE}/games/invite`;
    const params = { userID: String(userID), username2 };
    return await firstValueFrom(this.http.post<Game>(url, null, { params }));
  }

  // Multiplayer: poll for incoming invitation for current user
  async checkInvite(userID: number): Promise<Game> {
    const url = `${API_BASE}/games/check_invite`;
    const params = { userID: String(userID) };
    return await firstValueFrom(this.http.get<Game>(url, { params }));
  }

  // Multiplayer: accept or decline invitation for a given game
  async acceptInvite(gameID: number, answer: 'accept' | 'decline'): Promise<Game> {
    const url = `${API_BASE}/games/accept`;
    const params = { gameID: String(gameID), answer };
    return await firstValueFrom(this.http.post<Game>(url, null, { params }));
  }

  async guess(guess: string, gameID: number, userID: number): Promise<Game> {
    const url = `${API_BASE}/games/guess`;
    const params = { guess, gameID: String(gameID), userID: String(userID) };
    return await firstValueFrom(this.http.post<Game>(url, null, { params }));
  }

  async check(gameID: number): Promise<Game> {
    const url = `${API_BASE}/games/check`;
    const params = { gameID: String(gameID) };
    return await firstValueFrom(this.http.get<Game>(url, { params }));
  }
}

