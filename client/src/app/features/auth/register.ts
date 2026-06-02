import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div id="register-page" class="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-600 animate-fade-in">
        <div class="absolute inset-0 opacity-30">
          <div class="absolute top-1/3 -right-20 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/3 -left-20 w-96 h-96 bg-secondary-400/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1.2s"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <!-- Register card -->
      <div id="register-card" class="relative z-10 w-full max-w-md animate-slide-up">
        <div class="backdrop-blur-xl bg-white/80 dark:bg-slate-800/60 border border-white/20 shadow-2xl rounded-2xl p-8">
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-2xl font-bold shadow-lg mb-4">
              M
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ 'auth.registerTitle' | translate }}
            </h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {{ 'auth.registerSubtitle' | translate }}
            </p>
          </div>

          <!-- Error message -->
          @if (auth.error()) {
            <div id="register-error" class="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
              {{ auth.error() }}
            </div>
          }

          @if (passwordMismatch()) {
            <div id="password-mismatch-error" class="mb-4 p-3 rounded-xl bg-warning/10 border border-warning/20 text-warning text-sm animate-fade-in">
              Passwords do not match
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-4">
            <!-- Name -->
            <div>
              <label for="register-name" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {{ 'auth.name' | translate }}
              </label>
              <input
                id="register-name"
                type="text"
                [(ngModel)]="name"
                name="name"
                required
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder="John Doe"
              />
            </div>

            <!-- Email -->
            <div>
              <label for="register-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {{ 'auth.email' | translate }}
              </label>
              <input
                id="register-email"
                type="email"
                [(ngModel)]="email"
                name="email"
                required
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <!-- Password -->
            <div>
              <label for="register-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {{ 'auth.password' | translate }}
              </label>
              <input
                id="register-password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                minlength="6"
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <!-- Confirm Password -->
            <div>
              <label for="register-confirm-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {{ 'auth.confirmPassword' | translate }}
              </label>
              <input
                id="register-confirm-password"
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                required
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <!-- Submit -->
            <button
              id="btn-register"
              type="submit"
              [disabled]="auth.isLoading()"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              @if (auth.isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ 'auth.registering' | translate }}
                </span>
              } @else {
                {{ 'auth.register' | translate }}
              }
            </button>
          </form>

          <!-- Login link -->
          <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {{ 'auth.hasAccount' | translate }}
            <a
              id="link-login"
              routerLink="/login"
              class="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {{ 'auth.login' | translate }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Register {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected name = '';
  protected email = '';
  protected password = '';
  protected confirmPassword = '';
  protected readonly passwordMismatch = signal(false);

  onSubmit(): void {
    this.passwordMismatch.set(false);

    if (!this.name || !this.email || !this.password || !this.confirmPassword) return;

    if (this.password !== this.confirmPassword) {
      this.passwordMismatch.set(true);
      return;
    }

    this.auth.register(this.name, this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {},
    });
  }
}
