import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';

const AUTH_KEY = 'wochen-board-auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authenticated = signal(false);

  constructor() {
    this.checkStoredAuth();
  }

  private checkStoredAuth(): void {
    const stored = localStorage.getItem(AUTH_KEY);
    if (stored === 'true') {
      this.authenticated.set(true);
    }
  }

  isAuthenticated(): boolean {
    return this.authenticated();
  }

  login(password: string): boolean {
    if (password === environment.appPassword) {
      this.authenticated.set(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    this.authenticated.set(false);
    localStorage.removeItem(AUTH_KEY);
  }
}
