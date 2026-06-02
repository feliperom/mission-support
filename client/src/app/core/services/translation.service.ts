import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type SupportedLang = 'pt-BR' | 'en';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly http = inject(HttpClient);

  private readonly _currentLang = signal<SupportedLang>(this.getInitialLang());
  private readonly _translations = signal<Record<string, string>>({});
  private readonly _isLoaded = signal(false);

  readonly currentLang = this._currentLang.asReadonly();
  readonly isLoaded = this._isLoaded.asReadonly();

  private cache = new Map<string, Record<string, string>>();

  constructor() {
    this.loadTranslations(this._currentLang());
  }

  private getInitialLang(): SupportedLang {
    const stored = localStorage.getItem('lang') as SupportedLang;
    if (stored === 'pt-BR' || stored === 'en') return stored;
    return navigator.language.startsWith('pt') ? 'pt-BR' : 'en';
  }

  setLanguage(lang: SupportedLang): void {
    this._currentLang.set(lang);
    localStorage.setItem('lang', lang);
    this.loadTranslations(lang);
  }

  toggleLanguage(): void {
    const next = this._currentLang() === 'pt-BR' ? 'en' : 'pt-BR';
    this.setLanguage(next);
  }

  private loadTranslations(lang: SupportedLang): void {
    if (this.cache.has(lang)) {
      this._translations.set(this.cache.get(lang)!);
      this._isLoaded.set(true);
      return;
    }

    this.http.get<Record<string, string>>(`/assets/i18n/${lang}.json`).subscribe({
      next: (data) => {
        this.cache.set(lang, data);
        this._translations.set(data);
        this._isLoaded.set(true);
      },
      error: () => {
        console.warn(`Failed to load translations for ${lang}`);
        this._isLoaded.set(true);
      },
    });
  }

  translate(key: string): string {
    const translations = this._translations();
    return translations[key] || key;
  }

  t(key: string): string {
    return this.translate(key);
  }
}
