import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { OnInit, OnDestroy, inject, Component, HostListener, signal } from '@angular/core';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth.service';
import { Game } from '../models/game.model';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css'
})
export class GamePageComponent implements OnInit, OnDestroy {
  readonly rows = signal<string[][]>(Array.from({ length: 6 }, () => Array(5).fill('')));
  readonly statuses = signal<("ok"|"warn"|"bad"|"")[][]>(Array.from({ length: 6 }, () => Array(5).fill("")));
  readonly kb1 = ['Q','W','E','R','T','Z','U','I','O','P'];
  readonly kb2 = ['A','S','D','F','G','H','J','K','L'];
  readonly kb3 = ['Y','X','C','V','B','N','M'];
  readonly keyState = signal<Record<string, 'ok'|'warn'|'bad' | undefined>>({});
  readonly isWin = signal(false);
  readonly isGameOver = signal(false);
  readonly toast = signal<string | null>(null);
  readonly revealingRow = signal<number | null>(null);
  readonly winRowIndex = signal<number | null>(null);

  private currentRow = 0;
  private currentCol = 0;
  private readonly gameApi = inject(GameService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private userID: number | null = null;
  private gameID: number | null = null;
  private isMulti = false;
  private pollHandle: any = null;
  private multiEndNotified = false;
  private solutionWord: string | null = null;
  private toastAt: number | null = null;
  private toastTimer: any = null;
  private static readonly REMATCH_KEY = 'worlde-rematch';
  private onRematchDeclined = () => { this.showToast('Invitation declined.'); };
  
  private persistRematch(g: Game): void {
    if (!this.isMulti || !g || !this.userID) return;
    try {
      const inviterID = g.user1ID;
      const role = (this.userID === inviterID) ? 'inviter' : 'waiter';
      const opponentID = (this.userID === inviterID) ? g.user2ID : g.user1ID;
      // Prefer the last explicitly entered opponent username (exact backend key)
      let opponentUsername: string | null = null;
      try { opponentUsername = sessionStorage.getItem('worlde-last-opponent-username'); } catch {}
      if (!opponentUsername) {
        // Fallback to any locally known mapping
        opponentUsername = (this.auth as any).resolveKnownUsername?.(opponentID) || null;
      }
      const payload = { gameID: g.gameID, inviterID, opponentID, opponentUsername, role, ts: Date.now() };
      sessionStorage.setItem(GamePageComponent.REMATCH_KEY, JSON.stringify(payload));
    } catch {}
  }

  async ngOnInit(): Promise<void> {
    const user = this.auth.getCurrentUser();
    try { window.addEventListener('rematch-declined', this.onRematchDeclined as EventListener); } catch {}
    if (!user) {
      this.showToast('Bitte zuerst einloggen.');
      this.isGameOver.set(true);
      return;
    }
    this.userID = user.userID;
    // Detect multiplayer mode via query params
    const qp = this.route.snapshot.queryParamMap;
    const mode = qp.get('mode');
    const gid = qp.get('gameID');
    if (mode === 'multi' && gid) {
      this.isMulti = true;
      this.gameID = Number(gid);
      this.startMultiPolling();
      return;
    }
    // Fallback: start single player game
    try {
      const game = await this.gameApi.startSingleGame(this.userID);
      this.gameID = game.gameID;
      this.solutionWord = (game.guessWord || '').toUpperCase() || null;
    } catch (e) {
      // Backend-Fehler: bewusst dauerhaft sichtbar lassen
      this.toast.set('Backend nicht erreichbar.');
      this.isGameOver.set(true);
    }
  }

  handleKey(key: string): void {
    if (this.isGameOver() || this.isWin()) return;
    const rows = this.rows();
    const copy = rows.map((r) => r.slice());

    if (key === 'BACKSPACE') {
      if (this.currentCol > 0) {
        copy[this.currentRow][this.currentCol - 1] = '';
        this.currentCol--;
        this.rows.set(copy);
      }
      return;
    }

    if (key === 'ENTER') {
      if (this.currentCol === 5) { this.scoreRow(); }
      return;
    }

    if (/^[A-Z]$/.test(key) && this.currentCol < 5) {
      copy[this.currentRow][this.currentCol] = key;
      this.currentCol++;
      this.rows.set(copy);
    }
  }

  @HostListener('window:keydown', ['$event'])
  onKeydown(ev: KeyboardEvent): void {
    const k = ev.key;
    if (k === 'Enter') {
      this.handleKey('ENTER');
      ev.preventDefault();
      return;
    }
    if (k === 'Backspace') {
      this.handleKey('BACKSPACE');
      ev.preventDefault();
      return;
    }
    const letter = k.length === 1 ? k.toUpperCase() : '';
    if (/^[A-Z]$/.test(letter)) {
      this.handleKey(letter);
    }
  }

  private async scoreRow(): Promise<void> {
    if (this.isGameOver() || this.isWin()) return;
    if (this.userID == null || this.gameID == null) return;
    const rowIndex = this.currentRow;
    const guess = this.rows()[rowIndex].join('');
    try {
      const game: Game = await this.gameApi.guess(guess, this.gameID, this.userID);

      const listRaw = this.userID === game.user2ID ? game.guessesUser2 : game.guessesUser1;
      this.solutionWord = (game.guessWord || this.solutionWord || '').toUpperCase() || null;
      const all = (listRaw || '').split(',').filter(Boolean);
      let feedback = '';
      if (game.status === 'GAME_OVER' && game.winnerUserID === this.userID) {
        // Backend may store the winning feedback only in guessesUser1.
        // Ensure correct row animation by forcing GGGGG for the winning guess.
        feedback = 'GGGGG';
      } else {
        const last = all[all.length - 1] || '';
        const parts = last.split(':');
        feedback = parts[1] || '';
      }
      const res = Array.from({ length: 5 }, (_, i) => {
        const ch = feedback[i];
        return ch === 'G' ? 'ok' : ch === 'Y' ? 'warn' : 'bad';
      }) as ("ok"|"warn"|"bad")[];

      const statuses = this.statuses().map(r => r.slice());
      for (let i = 0; i < 5; i++) statuses[rowIndex][i] = res[i];
      this.statuses.set(statuses);
      this.revealingRow.set(rowIndex);

      const ks = { ...this.keyState() };
      const prio = (v: 'ok'|'warn'|'bad'|undefined) => v === 'ok' ? 3 : v === 'warn' ? 2 : v === 'bad' ? 1 : 0;
      for (let i = 0; i < 5; i++) { const ch = guess[i]; const s = res[i]; if (prio(s) > prio(ks[ch])) ks[ch] = s; }
      this.keyState.set(ks);

      if (this.currentRow < 5) { this.currentRow++; this.currentCol = 0; }

      const didWin = game.status === 'GAME_OVER' && game.winnerUserID === this.userID;
      const didLose = game.status === 'GAME_OVER' && game.winnerUserID !== this.userID;
      const flipDuration = 600;
      const stagger = 120;
      const total = flipDuration + stagger * 4 + 50;
      window.setTimeout(() => {
        this.revealingRow.set(null);
        if (didWin) {
          this.isWin.set(true);
          this.winRowIndex.set(rowIndex);
          this.showToast('Richtig!');
          if (!this.isMulti) {
            window.dispatchEvent(new CustomEvent('singleplayer-victory'));
          }
          if (this.isMulti && !this.multiEndNotified) {
            this.multiEndNotified = true;
            this.persistRematch(game);
            window.dispatchEvent(new CustomEvent('multiplayer-victory'));
          }
        } else if (didLose || rowIndex === 5) {
          this.isGameOver.set(true);
          // Show word in Game Over modal via app events
          if (!this.isMulti) {
            const word = (this.solutionWord || '').toUpperCase();
            window.dispatchEvent(new CustomEvent('singleplayer-lost', { detail: { word } }));
          }
          if ((didLose || rowIndex === 5) && this.isMulti && !this.multiEndNotified) {
            this.multiEndNotified = true;
            this.persistRematch(game);
            const word = (this.solutionWord || '').toUpperCase();
            window.dispatchEvent(new CustomEvent('multiplayer-lost', { detail: { word } }));
          }
        }
      }, total);
    } catch (e: any) {
      this.showToast('Word does not exist');
    }
  }

  private startMultiPolling(): void {
    if (!this.gameID) return;
    if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
    this.pollHandle = setInterval(async () => {
      try {
        const g: Game = await this.gameApi.check(this.gameID!);
        if (g && g.status === 'GAME_OVER' && !this.multiEndNotified) {
          this.multiEndNotified = true;
          const iWon = g.winnerUserID === this.userID;
          if (iWon) {
            this.isWin.set(true);
            window.dispatchEvent(new CustomEvent('multiplayer-victory'));
          } else {
            this.isGameOver.set(true);
            const word = ((g as any).guessWord || this.solutionWord || '').toUpperCase();
            window.dispatchEvent(new CustomEvent('multiplayer-lost', { detail: { word } }));
          }
          this.persistRematch(g);
          clearInterval(this.pollHandle);
          this.pollHandle = null;
        }
      } catch {
        // ignore transient errors
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
    if (this.toastTimer) { clearTimeout(this.toastTimer); this.toastTimer = null; }
    try { window.removeEventListener('rematch-declined', this.onRematchDeclined as EventListener); } catch {}
  }

  private showToast(msg: string, duration = 2000): void {
    const stamp = Date.now();
    this.toastAt = stamp;
    this.toast.set(msg);
    if (this.toastTimer) clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      if (this.toastAt === stamp) {
        this.toast.set(null);
      }
    }, duration);
  }
}
