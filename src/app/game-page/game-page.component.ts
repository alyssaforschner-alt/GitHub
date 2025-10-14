import { Component, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-game-page',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './game-page.component.html',
  styleUrl: './game-page.component.css'
})
export class GamePageComponent {
  readonly rows = signal<string[][]>(Array.from({ length: 6 }, () => Array(5).fill('')));
  readonly statuses = signal<("ok"|"warn"|"bad"|"")[][]>(Array.from({ length: 6 }, () => Array(5).fill("")));
  readonly kb1 = ['Q','W','E','R','T','Z','U','I','O','P'];
  readonly kb2 = ['A','S','D','F','G','H','J','K','L'];
  readonly kb3 = ['Y','X','C','V','B','N','M'];
  readonly keyState = signal<Record<string, 'ok'|'warn'|'bad' | undefined>>({});
  readonly target = signal<string>('WORTE'); // Demo-Zielwort (5 Großbuchstaben)
  private readonly germanWords: string[] = [
    'WORTE','SPIEL','MAUER','BLATT','TISCH','STERN','WELLE','STEIN','FLUSS','WAGEN','ANGEL','STUHL','FARBE','NACHT','LICHT','PFERD'
  ];
  readonly isWin = signal(false);
  readonly isGameOver = signal(false);
  readonly toast = signal<string | null>(null);
  readonly revealingRow = signal<number | null>(null);
  readonly winRowIndex = signal<number | null>(null);

  private currentRow = 0;
  private currentCol = 0;

  constructor() {
    // Zufälliges deutsches Testwort wählen
    const pick = this.germanWords[Math.floor(Math.random() * this.germanWords.length)];
    this.target.set(pick);
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
      if (this.currentCol === 5) {
        this.scoreRow();
      }
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
    // Normalize letters (A-Z); ignore other keys
    const letter = k.length === 1 ? k.toUpperCase() : '';
    if (/^[A-Z]$/.test(letter)) {
      this.handleKey(letter);
    }
  }

  private scoreRow(): void {
    const rowIndex = this.currentRow;
    const guess = this.rows()[rowIndex].join('');
    const target = this.target();
    const res = this.evaluate(guess, target);

    const statuses = this.statuses().map(r => r.slice());
    for (let i = 0; i < 5; i++) statuses[rowIndex][i] = res[i];
    this.statuses.set(statuses);
    this.revealingRow.set(rowIndex);

    // Tastatur färben (ok > warn > bad)
    const ks = { ...this.keyState() };
    const prio = (v: 'ok'|'warn'|'bad'|undefined) => v === 'ok' ? 3 : v === 'warn' ? 2 : v === 'bad' ? 1 : 0;
    for (let i = 0; i < 5; i++) { const ch = guess[i]; const s = res[i]; if (prio(s) > prio(ks[ch])) ks[ch] = s; }
    this.keyState.set(ks);

    // Nächste Zeile vorbereiten
    if (this.currentRow < 5) { this.currentRow++; this.currentCol = 0; }

    const isWin = guess === target;
    const flipDuration = 600; // ms
    const stagger = 120; // ms pro Kachel
    const total = flipDuration + stagger * 4 + 50;
    window.setTimeout(() => {
      this.revealingRow.set(null);
      if (isWin) {
        this.isWin.set(true);
        this.winRowIndex.set(rowIndex);
        this.toast.set('Richtig!');
      } else if (rowIndex === 5) {
        this.isGameOver.set(true);
        this.toast.set(`Leider falsch. Wort: ${target}`);
      }
    }, total);
  }

  private evaluate(guess: string, target: string): ("ok"|"warn"|"bad")[] {
    const res: ("ok"|"warn"|"bad")[] = Array(5).fill('bad');
    const counts: Record<string, number> = {};
    for (let i = 0; i < 5; i++) counts[target[i]] = 1 + (counts[target[i]] || 0);
    for (let i = 0; i < 5; i++) if (guess[i] === target[i]) { res[i] = 'ok'; counts[guess[i]]--; }
    for (let i = 0; i < 5; i++) if (res[i] === 'bad' && (counts[guess[i]] || 0) > 0) { res[i] = 'warn'; counts[guess[i]]--; }
    return res;
  }
}
