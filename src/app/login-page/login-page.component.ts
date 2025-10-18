import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
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
  private readonly http = inject(HttpClient);
  readonly isSubmitting = signal(false);
  readonly loginMessage = signal<string | null>(null);

  readonly form = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  async submit(): Promise<void> {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.isSubmitting.set(true);
    this.loginMessage.set(null);
    const { username, password } = this.form.getRawValue();
    try {
      const response = await this.http.post<any>(
        'http://localhost:8080/api/users/login',
        { username, password },
        { headers: { 'Content-Type': 'application/json' } }
      ).toPromise();
      if (response) { 
        // optional: store a lightweight marker
        localStorage.setItem('worlde-auth', JSON.stringify({ username, at: Date.now() }));
        this.router.navigateByUrl('/home');
        return;
      }
      this.loginMessage.set('Login fehlgeschlagen!');
    } catch (err) {
      this.loginMessage.set('Fehler beim Senden der Login-Daten');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}

