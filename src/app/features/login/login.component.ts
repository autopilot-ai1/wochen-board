import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div class="w-full max-w-sm">
        <!-- Logo / Brand -->
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-landerer-500 mb-4">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-2xl font-semibold text-gray-900">Wochen-Board</h1>
          <p class="text-sm text-gray-500 mt-1">Landerer Energie</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-2xl shadow-card p-8">
          <form (ngSubmit)="onSubmit()" class="space-y-6">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
                Passwort
              </label>
              <input
                id="password"
                type="password"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                class="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Passwort eingeben"
                [class.border-red-300]="error()"
                [class.focus:border-red-500]="error()"
              />
              @if (error()) {
                <p class="mt-2 text-sm text-red-600">{{ error() }}</p>
              }
            </div>

            <button
              type="submit"
              class="w-full py-3 px-4 bg-landerer-500 hover:bg-landerer-600 text-white font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-landerer-500 focus:ring-offset-2"
            >
              Anmelden
            </button>
          </form>
        </div>

        <p class="text-center text-xs text-gray-400 mt-8">
          © {{ currentYear }} Landerer Energie GmbH
        </p>
      </div>
    </div>
  `
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  password = '';
  error = signal<string | null>(null);
  currentYear = new Date().getFullYear();

  onSubmit(): void {
    this.error.set(null);

    if (!this.password) {
      this.error.set('Bitte Passwort eingeben');
      return;
    }

    if (this.authService.login(this.password)) {
      this.router.navigate(['/']);
    } else {
      this.error.set('Falsches Passwort');
      this.password = '';
    }
  }
}
