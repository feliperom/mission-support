import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { TranslationService } from '../../core/services/translation.service';
import { TranslatePipe } from '../../core/pipes/translate.pipe';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, TranslatePipe],
  template: `
    <div id="login-page" class="min-h-dvh flex items-center justify-center p-4 relative overflow-hidden">
      <!-- Animated gradient background -->
      <div class="absolute inset-0 bg-gradient-to-br from-primary-900 via-primary-700 to-secondary-600 animate-fade-in">
        <div class="absolute inset-0 opacity-30">
          <div class="absolute top-1/4 -left-20 w-96 h-96 bg-primary-400/30 rounded-full blur-3xl animate-pulse"></div>
          <div class="absolute bottom-1/4 -right-20 w-96 h-96 bg-secondary-400/30 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s"></div>
          <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-3xl"></div>
        </div>
      </div>

      <!-- Login card -->
      <div
        id="login-card"
        class="relative z-10 w-full max-w-md animate-slide-up"
      >
        <div class="backdrop-blur-xl bg-white/80 dark:bg-slate-800/60 border border-white/20 shadow-2xl rounded-2xl p-8">
          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white text-2xl font-bold shadow-lg mb-4">
              M
            </div>
            <h1 class="text-2xl font-bold text-slate-900 dark:text-white">
              {{ 'auth.loginTitle' | translate }}
            </h1>
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {{ 'auth.loginSubtitle' | translate }}
            </p>
          </div>

          <!-- Error message -->
          @if (auth.error()) {
            <div id="login-error" class="mb-4 p-3 rounded-xl bg-danger/10 border border-danger/20 text-danger text-sm animate-fade-in">
              {{ auth.error() }}
            </div>
          }

          <!-- Form -->
          <form (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label for="login-email" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {{ 'auth.email' | translate }}
              </label>
              <input
                id="login-email"
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
              <label for="login-password" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                {{ 'auth.password' | translate }}
              </label>
              <input
                id="login-password"
                type="password"
                [(ngModel)]="password"
                name="password"
                required
                class="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
                placeholder="••••••••"
              />
            </div>

            <!-- Forgot password -->
            <div class="flex justify-end">
              <a href="#" class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors">
                {{ 'auth.forgotPassword' | translate }}
              </a>
            </div>

            <!-- Submit -->
            <button
              id="btn-login"
              type="submit"
              [disabled]="auth.isLoading()"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-semibold shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              @if (auth.isLoading()) {
                <span class="flex items-center justify-center gap-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {{ 'auth.loggingIn' | translate }}
                </span>
              } @else {
                {{ 'auth.login' | translate }}
              }
            </button>
          </form>

          <!-- Register link -->
          <p class="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
            {{ 'auth.noAccount' | translate }}
            <a
              id="link-register"
              routerLink="/register"
              class="text-primary-600 dark:text-primary-400 font-semibold hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              {{ 'auth.register' | translate }}
            </a>
          </p>
        </div>
      </div>
    </div>
  `,
})
export class Login {
  protected readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly i18n = inject(TranslationService);

  protected email = '';
  protected password = '';

  onSubmit(): void {
    if (!this.email || !this.password) return;

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']);
      },
      error: () => {
        // Error is handled by AuthService signal
      },
    });
  }
}
