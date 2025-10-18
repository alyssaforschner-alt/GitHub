import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  readonly isSubmitting = signal(false);
  readonly loginMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  private readonly http = inject(HttpClient);

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    this.loginMessage.set(null);
    const { username, password } = this.form.getRawValue();
    try {
      const response = await this.http.post<any>(
        'http://localhost:3000/api/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' }, responseType: 'json' }
      ).toPromise();
      if (response && response.ok) {
        this.router.navigateByUrl('/home');
      } else {
        this.loginMessage.set('Login fehlgeschlagen!');
      }
    } catch (err) {
      this.loginMessage.set('Fehler beim Senden der Login-Daten!');
    }
    this.isSubmitting.set(false);
  }
}

