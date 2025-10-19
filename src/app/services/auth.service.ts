import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_BASE } from '../api.config';
import { User } from '../models/user.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

const AUTH_KEY = 'worlde-auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);

  login(username: string, password: string): Observable<User> {
    return this.http
      .post<User>(`${API_BASE}/users/login`, { username, password })
      .pipe(
        tap((user) => {
          // Persist minimal user info for later use
          localStorage.setItem(
            AUTH_KEY,
            JSON.stringify({ userID: user.userID, username: user.username })
          );
        })
      );
  }

  getCurrentUser(): User | null {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (typeof parsed?.userID === 'number' && typeof parsed?.username === 'string') {
        return parsed as User;
      }
    } catch {
      // ignore malformed data
    }
    return null;
  }

  logout(): void {
    localStorage.removeItem(AUTH_KEY);
  }
}
