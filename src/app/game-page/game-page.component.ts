import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { OnInit, inject, Component, HostListener, signal } from '@angular/core';
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
export class GamePageComponent implements OnInit {
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
  private userID: number | null = null;
  private gameID: number | null = null;

  async ngOnInit(): Promise<void> {
    const user = this.auth.getCurrentUser();
    if (!user) {
      this.toast.set('Bitte zuerst einloggen.');
      this.isGameOver.set(true);
      return;
    }
    this.userID = user.userID;
    try {
      const game = await this.gameApi.startSingleGame(this.userID);
      this.gameID = game.gameID;
    } catch (e) {
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
      const all = (listRaw || '').split(',').filter(Boolean);
      const last = all[all.length - 1] || '';
      const parts = last.split(':');
      const feedback = parts[1] || '';
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
          this.toast.set('Richtig!');
        } else if (didLose || rowIndex === 5) {
          this.isGameOver.set(true);
          this.toast.set('Leider falsch.');
        }
      }, total);
    } catch (e: any) {
      this.toast.set('Wort existiert nicht.');
    }
  }
}

