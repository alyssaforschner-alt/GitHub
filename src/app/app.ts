import { Component, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterOutlet, NavigationEnd } from '@angular/router';

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

  constructor(private readonly router: Router) {
    window.addEventListener('neon-toggle', this.onNeonToggle as EventListener);
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
      if (ev instanceof NavigationEnd) setFromUrl(ev.urlAfterRedirects);
    });
  }

  ngOnDestroy(): void {
    window.removeEventListener('neon-toggle', this.onNeonToggle as EventListener);
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
  closeModals(): void { this.showHelp.set(false); this.showHistory.set(false); this.showExit.set(false); }
  confirmExit(): void { this.closeModals(); this.router.navigateByUrl('/home'); }
}
