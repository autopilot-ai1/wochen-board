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
    <div class="min-h-screen flex items-center justify-center bg-[#FAFAFA] px-4">
      <div class="w-full max-w-xs">
        <!-- Logo / Brand -->
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 mb-4 shadow-sm">
            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
            </svg>
          </div>
          <h1 class="text-xl font-semibold text-gray-900 tracking-tight">Wochen-Board</h1>
          <p class="text-sm text-gray-400 mt-1">Landerer Energie</p>
        </div>

        <!-- Login Card -->
        <div class="bg-white rounded-xl border border-gray-200 p-6">
          <form (ngSubmit)="onSubmit()">
            <div class="mb-4">
              <input
                type="password"
                [(ngModel)]="password"
                name="password"
                autocomplete="current-password"
                class="w-full px-4 py-3 text-[15px] rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none transition-all text-gray-900 placeholder-gray-400"
                placeholder="Passwort"
                [class.border-red-300]="error()"
              />
              @if (error()) {
                <p class="mt-2 text-sm text-red-500">{{ error() }}</p>
              }
            </div>

            <button
              type="submit"
              class="w-full py-3 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Anmelden
            </button>
          </form>
        </div>

        <p class="text-center text-xs text-gray-400 mt-6">
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
