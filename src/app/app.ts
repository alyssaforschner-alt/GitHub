import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';
import { GameService } from './services/game.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  readonly title = signal('Worlde2');
  readonly isMenuOpen = signal(false);
  readonly isNeon = signal(true);
  readonly showTopbar = signal(true);
  // Modals
  readonly showHelp = signal(false);
  readonly showHistory = signal(false);
  readonly showVictory = signal(false);
  readonly showLost = signal(false);
  readonly showExit = signal(false);
  readonly showAccept = signal(false);
  readonly currentPath = signal<string>('');
  private invitePollHandle: any = null;
  private pendingInviteGameID: number | null = null;
  private pollingUserID: number | null = null;
  readonly pendingInviteFrom = signal<string | null>(null);
  readonly lostWord = signal<string | null>(null);
  // While an invite action is in progress, disable UI
  readonly isHandlingInvite = signal(false);
  // Debounce/ignore a just-handled invite for a short period to avoid flicker
  private suppressInviteID: number | null = null;
  private suppressInviteUntil = 0;

  toggleMenu(): void {
    this.isMenuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.isMenuOpen.set(false);
  }

  toggleNeon(): void {
    const next = !this.isNeon();
    this.setNeon(next);
  }
  private onNeonToggle = (ev: Event) => {
    const on = (ev as CustomEvent).detail?.on as boolean | undefined;
    if (typeof on === 'boolean') {
      this.setNeon(on);
    }
  };
  private onMultiVictory = () => { this.openVictory(); };
  private onMultiLost = (ev: Event) => {
    const w = (ev as CustomEvent).detail?.word as string | undefined;
    if (w && typeof w === 'string') this.lostWord.set(w);
    this.openLost();
  };
  private onSingleVictory = () => { this.openVictory(); };
  private onSingleLost = (ev: Event) => {
    const w = (ev as CustomEvent).detail?.word as string | undefined;
    if (w && typeof w === 'string') this.lostWord.set(w);
    this.openLost();
  };

  constructor(private readonly router: Router, private readonly gameApi: GameService, private readonly auth: AuthService) {
    window.addEventListener('neon-toggle', this.onNeonToggle as EventListener);
    window.addEventListener('multiplayer-victory', this.onMultiVictory as EventListener);
    window.addEventListener('multiplayer-lost', this.onMultiLost as EventListener);
    window.addEventListener('singleplayer-victory', this.onSingleVictory as EventListener);
    window.addEventListener('singleplayer-lost', this.onSingleLost as EventListener);
    // Initialize document class for external pages
    this.applyNeonClass(this.isNeon());

    // Hide topbar on Start ("/"), Home ("/home"), and Login ("/login") screens
    const setFromUrl = (url: string) => {
      const path = url.split('?')[0];
      this.currentPath.set(path);
      const hide = path === '/home' || path === '/' || path === '' || path === '/login';
      this.showTopbar.set(!hide);
    };
    setFromUrl(this.router.url);
    this.router.events.subscribe(ev => {
      if (ev instanceof NavigationEnd) {
        setFromUrl(ev.urlAfterRedirects);
        // Suppress invite polling while on the login or game route
        const onLogin = this.currentPath() === '/login';
        const onGame = this.currentPath().startsWith('/spiel');
        if (onLogin || onGame) {
          if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
          this.pollingUserID = null;
          this.pendingInviteGameID = null;
          this.pendingInviteFrom.set(null);
          this.showAccept.set(false);
          return;
        }
        const u = this.auth.getCurrentUser();
        // Stop polling when no user is logged in
        if (!u) {
          if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
          this.pollingUserID = null;
          this.pendingInviteGameID = null;
          this.showAccept.set(false);
          this.pendingInviteFrom.set(null);
          return;
        }
        // (Re)start polling when the logged-in user changes
        if (this.pollingUserID !== u.userID) {
          if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
          this.startInvitePolling(u.userID);
        }
      }
    });

    // Start invite polling if a user is logged in and not on login/game route
    const user = this.auth.getCurrentUser();
    if (user && this.currentPath() !== '/login' && !this.currentPath().startsWith('/spiel')) this.startInvitePolling(user.userID);
  }

  ngOnDestroy(): void {
    window.removeEventListener('neon-toggle', this.onNeonToggle as EventListener);
    window.removeEventListener('multiplayer-victory', this.onMultiVictory as EventListener);
    window.removeEventListener('multiplayer-lost', this.onMultiLost as EventListener);
    window.removeEventListener('singleplayer-victory', this.onSingleVictory as EventListener);
    window.removeEventListener('singleplayer-lost', this.onSingleLost as EventListener);
    if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
    this.pollingUserID = null;
  }

  private setNeon(on: boolean): void {
    this.isNeon.set(on);
    this.applyNeonClass(on);
  }

  private applyNeonClass(on: boolean): void {
    const root = document.documentElement;
    root.classList.toggle('neon-on', on);
  }

  // Header actions
  openHelp(): void { this.showHelp.set(true); }
  openHistory(): void { this.showHistory.set(true); }
  openVictory(): void { this.showVictory.set(true); }
  openLost(): void { this.showLost.set(true); }
  openAccept(): void { this.showAccept.set(true); }
  onHomeClick(): void {
    const path = this.currentPath();
    if (path.startsWith('/spiel')) this.showExit.set(true);
    else this.router.navigateByUrl('/home');
  }
  closeModals(): void {
    this.showHelp.set(false);
    this.showHistory.set(false);
    this.showExit.set(false);
    this.showAccept.set(false);
    this.showVictory.set(false);
    this.showLost.set(false);
    this.pendingInviteFrom.set(null);
    this.lostWord.set(null);
  }
  confirmExit(): void { this.closeModals(); this.router.navigateByUrl('/home'); }

  playAgain(): void {
    // Close result modals first
    this.showVictory.set(false);
    this.showLost.set(false);
    // Determine current mode from URL (query preserved in router.url)
    const url = this.router.url || '';
    const onGame = this.currentPath().startsWith('/spiel');
    const isMulti = url.includes('mode=multi');

    if (isMulti) {
      // Mark that this tab wants an immediate rematch; waiter will auto-accept
      try { sessionStorage.setItem('worlde-rematch-ready', '1'); } catch {}
      // In multiplayer, go to the multiplayer setup to start a new match
      this.router.navigateByUrl('/multiplayer');
      return;
    }

    // Singleplayer: navigate to game; if already on the game route, detour to force reinit
    const goToGame = () => this.router.navigate(['/spiel']);
    if (onGame) {
      this.router.navigateByUrl('/home').then(() => goToGame());
    } else {
      goToGame();
    }
  }

  private startInvitePolling(userID: number): void {
    if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
    this.pollingUserID = userID;
    this.invitePollHandle = setInterval(async () => {
      try {
        if (this.currentPath() === '/login' || this.currentPath().startsWith('/spiel')) {
          return; // do not process invites on the login route
        }
        const current = this.auth.getCurrentUser();
        if (!current || current.userID !== this.pollingUserID) {
          return; // user changed; ignore until interval is reset
        }
        const g = await this.gameApi.checkInvite(current.userID);
        if (g && g.status === 'INVITED' && g.gameID && g.gameID !== 0) {
          // Ignore the same invite for a short grace period after accept/decline
          if (this.suppressInviteID === g.gameID && Date.now() < this.suppressInviteUntil) {
            return;
          }
          // Auto-accept rematch when both players pressed Play Again
          try {
            const want = sessionStorage.getItem('worlde-rematch-ready') === '1';
            const raw = sessionStorage.getItem('worlde-rematch');
            const info = raw ? JSON.parse(raw) as any : null;
            if (want && info && info.role === 'waiter' && (g.user1ID === info.opponentID || g.user1ID === info.inviterID)) {
              // Stop polling to avoid races
              if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
              this.pollingUserID = null;
              this.suppressInviteID = g.gameID;
              this.suppressInviteUntil = Date.now() + 7000;
              await this.gameApi.acceptInvite(g.gameID, 'accept');
              try { await this.gameApi.check(g.gameID); } catch {}
              try { sessionStorage.removeItem('worlde-rematch-ready'); } catch {}
              this.showAccept.set(false);
              this.pendingInviteFrom.set(null);
              this.pendingInviteGameID = null;
              this.router.navigate(['/spiel'], { queryParams: { mode: 'multi', gameID: g.gameID } });
              return;
            }
          } catch { /* ignore malformed state */ }
          // Always keep ID and name in sync
          this.pendingInviteGameID = g.gameID;
          const fromName = (g as any).user1Name ?? `User ${g.user1ID}`;
          this.pendingInviteFrom.set(fromName);
          // Only open modal if not already visible
          if (!this.showAccept()) this.showAccept.set(true);
        }
      } catch {
        // ignore transient errors
      }
    }, 2000);
  }

  async acceptInvite(): Promise<void> {
    let id = this.pendingInviteGameID;
    if (!id) {
      try {
        const current = this.auth.getCurrentUser();
        if (!current) { this.showAccept.set(false); return; }
        const g = await this.gameApi.checkInvite(current.userID);
        if (!g || !g.gameID || g.status !== 'INVITED') { this.showAccept.set(false); return; }
        id = g.gameID;
        this.pendingInviteGameID = id;
        const fromName = (g as any).user1Name ?? `User ${g.user1ID}`;
        this.pendingInviteFrom.set(fromName);
      } catch {
        this.showAccept.set(false); return;
      }
    }
    try {
      // Mark handling and suppress immediate re-popups; stop polling now
      this.isHandlingInvite.set(true);
      this.suppressInviteID = id;
      this.suppressInviteUntil = Date.now() + 7000;
      if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
      this.pollingUserID = null;

      await this.gameApi.acceptInvite(id, 'accept');
      // Ensure the game transitions to GAME_ON promptly
      try { await this.gameApi.check(id); } catch {}
      this.showAccept.set(false);
      this.pendingInviteFrom.set(null);
      this.pendingInviteGameID = null;
    } catch {
      this.showAccept.set(false);
      this.pendingInviteFrom.set(null);
      this.pendingInviteGameID = null;
    } finally {
      this.isHandlingInvite.set(false);
      // Navigate to the multiplayer game regardless; server state should settle quickly
      this.router.navigate(['/spiel'], { queryParams: { mode: 'multi', gameID: id } });
    }
  }

  async declineInvite(): Promise<void> {
    let id = this.pendingInviteGameID;
    if (!id) {
      try {
        const current = this.auth.getCurrentUser();
        if (!current) { this.showAccept.set(false); return; }
        const g = await this.gameApi.checkInvite(current.userID);
        if (!g || !g.gameID || g.status !== 'INVITED') { this.showAccept.set(false); return; }
        id = g.gameID;
        this.pendingInviteGameID = id;
        const fromName = (g as any).user1Name ?? `User ${g.user1ID}`;
        this.pendingInviteFrom.set(fromName);
      } catch {
        this.showAccept.set(false); return;
      }
    }
    try {
      // Mark handling and suppress immediate re-popups; stop polling now
      this.isHandlingInvite.set(true);
      this.suppressInviteID = id;
      this.suppressInviteUntil = Date.now() + 7000;
      if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
      this.pollingUserID = null;
      await this.gameApi.acceptInvite(id, 'decline');
    } catch {
      // ignore
    } finally {
      // Suppress any re-prompt for this invite briefly
      // Stop invite polling now; router guard will restart as needed later
      this.showAccept.set(false);
      this.pendingInviteFrom.set(null);
      this.pendingInviteGameID = null;
      this.isHandlingInvite.set(false);
      // Resume invite polling to allow new invitations after decline
      const current = this.auth.getCurrentUser();
      if (current && this.currentPath() !== '/login' && !this.currentPath().startsWith('/spiel')) {
        this.startInvitePolling(current.userID);
      }
    }
  }
}
