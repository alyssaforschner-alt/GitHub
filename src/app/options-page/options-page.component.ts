import { Component, computed, inject } from '@angular/core';

@Component({
  selector: 'app-options-page',
  standalone: true,
  templateUrl: './options-page.component.html'
})
export class OptionsPageComponent {
  // Bridge to App neon state via document body class or global variable would be overkill.
  // We re-dispatch a custom event that App listens to by toggling a data attribute.
  isNeon = () => document.documentElement.classList.contains('neon-on');

  toggleNeon(): void {
    const root = document.documentElement;
    const on = root.classList.toggle('neon-on');
    const ev = new CustomEvent('neon-toggle', { detail: { on } });
    window.dispatchEvent(ev);
  }
}

