import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _isDark = signal(this.getInitialTheme());
  readonly isDark = this._isDark.asReadonly();

  constructor() {
    effect(() => {
      const dark = this._isDark();
      document.documentElement.classList.toggle('dark', dark);
      localStorage.setItem('theme', dark ? 'dark' : 'light');
    });
  }

  private getInitialTheme(): boolean {
    const stored = localStorage.getItem('theme');
    if (stored) {
      return stored === 'dark';
    }
    // Default to light instead of checking prefers-color-scheme
    return false;
  }

  toggle(): void {
    this._isDark.update((v) => !v);
  }

  setDark(dark: boolean): void {
    this._isDark.set(dark);
  }
}
