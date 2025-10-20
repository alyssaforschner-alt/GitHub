import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../api.config';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const AUTH_KEY = 'worlde-auth';
const KNOWN_USERS_KEY = 'worlde-known-users';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  private addKnownUser(user: User): void {
    try {
      const raw = localStorage.getItem(KNOWN_USERS_KEY);
      const map: Record<number, string> = raw ? JSON.parse(raw) : {};
      map[user.userID] = user.username;
      localStorage.setItem(KNOWN_USERS_KEY, JSON.stringify(map));
    } catch {
      // ignore
    }
  }

  resolveKnownUsername(userID: number): string | null {
    try {
      const raw = localStorage.getItem(KNOWN_USERS_KEY);
      if (!raw) return null;
      const map: Record<string, string> = JSON.parse(raw);
      // keys may be stored as strings in JSON
      return map[String(userID)] ?? (map as unknown as Record<number, string>)[userID] ?? null;
    } catch {
      return null;
    }
  }

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${API_BASE}/users/login`, { username, password })
      .pipe(
        tap((user) => {
          // Persist minimal user info for later use
          sessionStorage.setItem(
            AUTH_KEY,
            JSON.stringify({ userID: user.userID, username: user.username })
          );
          // Remember this user in a local known-users map for cross-session name resolution
          this.addKnownUser(user);
        })
      );
  }

  getCurrentUser(): User | null {
    try {
      const raw = sessionStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.userID === 'number' && typeof parsed?.username === 'string') {
        // Ensure the current user is also remembered in known-users
        this.addKnownUser(parsed as User);
        return parsed as User;
      }
    } catch {
      // ignore malformed data
    }
    return null;
  }

  logout(): void {
    sessionStorage.removeItem(AUTH_KEY);
  }
}
