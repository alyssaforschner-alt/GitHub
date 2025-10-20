import { Component, signal, inject, OnDestroy, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { GameService } from '../services/game.service';
import { AuthService } from '../services/auth.service';
import { Game } from '../models/game.model';

@Component({
  selector: 'app-multiplayer-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './multiplayer-page.component.html',
  styleUrl: './multiplayer-page.component.css'
})
export class MultiplayerPageComponent implements OnInit, OnDestroy {
  private readonly fb = inject(FormBuilder);
  private readonly gameApi = inject(GameService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly isSubmitting = signal(false);
  readonly inviteSent = signal<string | null>(null);
  private pollHandle: any = null;
  private createdGameID: number | null = null;
  private static readonly REMATCH_KEY = 'worlde-rematch';
  private rematchHandled = false;

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    this.maybeStartRematch();
  }

  async sendInvite(): Promise<void> {
    this.inviteSent.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const user = this.auth.getCurrentUser();
    if (!user) { this.inviteSent.set('Bitte zuerst einloggen.'); return; }
    const { username } = this.form.getRawValue();
    this.isSubmitting.set(true);
    try {
      const game = await this.gameApi.invite(user.userID, String(username));
      this.createdGameID = game.gameID;
      this.inviteSent.set(`Invitation sent to ${username}`);
      // Start polling this game until it becomes GAME_ON
      this.startPollingForStart();
    } catch (e) {
      this.inviteSent.set('Einladung konnte nicht gesendet werden.');
    } finally {
      this.isSubmitting.set(false);
    }
  }

  private startPollingForStart(): void {
    if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
    const gameID = this.createdGameID;
    if (!gameID) return;
    this.pollHandle = setInterval(async () => {
      try {
        const g: Game = await this.gameApi.check(gameID);
        if (g && (g.status === 'GAME_ON' || g.status === 'ACCEPTED')) {
          clearInterval(this.pollHandle);
          this.pollHandle = null;
          this.router.navigate(['/spiel'], { queryParams: { mode: 'multi', gameID: g.gameID } });
        } else if (g && g.status === 'DECLINED') {
          clearInterval(this.pollHandle);
          this.pollHandle = null;
          this.inviteSent.set('Invitation declined.');
          this.createdGameID = null;
        }
      } catch {
        // ignore transient errors while polling
      }
    }, 2000);
  }

  private maybeStartRematch(): void {
    if (this.rematchHandled) return;
    try {
      const raw = sessionStorage.getItem(MultiplayerPageComponent.REMATCH_KEY);
      if (!raw) return;
      const info = JSON.parse(raw) as { role: 'inviter'|'waiter'; opponentID: number; opponentUsername?: string | null };
      this.rematchHandled = true;
      if (info.role === 'inviter') {
        const name = info.opponentUsername ?? this.auth.resolveKnownUsername(info.opponentID) ?? '';
        if (name) {
          this.form.patchValue({ username: name });
          // slight delay to allow view init in case
          setTimeout(() => this.sendInvite(), 50);
          this.inviteSent.set(`Rematch invitation sent to ${name}`);
          // inviter info consumed
          sessionStorage.removeItem(MultiplayerPageComponent.REMATCH_KEY);
        } else {
          this.inviteSent.set('Rematch: Bitte Gegnernamen eingeben.');
        }
      } else {
        // waiter: simply wait for incoming invite
        this.inviteSent.set('Rematch: Warte auf Einladung des Gegners...');
        // keep REMATCH_KEY for App auto-accept logic
      }
    } catch {
      // ignore malformed state
    }
  }

  ngOnDestroy(): void {
    if (this.pollHandle) { clearInterval(this.pollHandle); this.pollHandle = null; }
  }
}

