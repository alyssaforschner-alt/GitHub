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
  private onMultiLost = () => { this.openLost(); };

  constructor(private readonly router: Router, private readonly gameApi: GameService, private readonly auth: AuthService) {
    window.addEventListener('neon-toggle', this.onNeonToggle as EventListener);
    window.addEventListener('multiplayer-victory', this.onMultiVictory as EventListener);
    window.addEventListener('multiplayer-lost', this.onMultiLost as EventListener);
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
        const u = this.auth.getCurrentUser();
        if (u && !this.invitePollHandle) this.startInvitePolling(u.userID);
      }
    });

    // Start invite polling if a user is logged in
    const user = this.auth.getCurrentUser();
    if (user) this.startInvitePolling(user.userID);
  }

  ngOnDestroy(): void {
    window.removeEventListener('neon-toggle', this.onNeonToggle as EventListener);
    window.removeEventListener('multiplayer-victory', this.onMultiVictory as EventListener);
    window.removeEventListener('multiplayer-lost', this.onMultiLost as EventListener);
    if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
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
  closeModals(): void { this.showHelp.set(false); this.showHistory.set(false); this.showExit.set(false); this.showAccept.set(false); }
  confirmExit(): void { this.closeModals(); this.router.navigateByUrl('/home'); }

  private startInvitePolling(userID: number): void {
    if (this.invitePollHandle) { clearInterval(this.invitePollHandle); this.invitePollHandle = null; }
    this.invitePollHandle = setInterval(async () => {
      try {
        const g = await this.gameApi.checkInvite(userID);
        if (g && g.status === 'INVITED' && g.gameID && g.gameID !== 0) {
          this.pendingInviteGameID = g.gameID;
          this.showAccept.set(true);
        }
      } catch {
        // ignore transient errors
      }
    }, 2000);
  }

  async acceptInvite(): Promise<void> {
    if (!this.pendingInviteGameID) { this.showAccept.set(false); return; }
    const id = this.pendingInviteGameID;
    try {
      await this.gameApi.acceptInvite(id, 'accept');
      this.showAccept.set(false);
      this.router.navigate(['/spiel'], { queryParams: { mode: 'multi', gameID: id } });
    } catch {
      this.showAccept.set(false);
    }
  }

  async declineInvite(): Promise<void> {
    if (!this.pendingInviteGameID) { this.showAccept.set(false); return; }
    const id = this.pendingInviteGameID;
    try {
      await this.gameApi.acceptInvite(id, 'decline');
    } catch {
      // ignore
    } finally {
      this.showAccept.set(false);
    }
  }
}
