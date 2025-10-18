import { Component, signal, inject } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-multiplayer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './multiplayer-page.component.html',
  styleUrl: './multiplayer-page.component.css'
})
export class MultiplayerPageComponent {
  private readonly fb = inject(FormBuilder);
  readonly isSubmitting = signal(false);
  readonly inviteSent = signal<string | null>(null);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
  });

  async sendInvite(): Promise<void> {
    this.inviteSent.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    await new Promise(r => setTimeout(r, 600));
    const { username } = this.form.getRawValue();
    this.inviteSent.set(`Invitation sent to ${username}`);
    this.isSubmitting.set(false);
  }
}

