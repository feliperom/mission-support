import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { ThemeService } from '../core/services/theme.service';
import { TranslationService } from '../core/services/translation.service';
import { TranslatePipe } from '../core/pipes/translate.pipe';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, TranslatePipe],
  template: `
    <div id="layout-root" class="flex h-dvh overflow-hidden bg-surface-light dark:bg-surface-dark">
      <!-- Mobile overlay -->
      @if (sidebarOpen()) {
        <div
          id="sidebar-overlay"
          class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Sidebar -->
      <aside
        id="sidebar"
        class="fixed inset-y-0 left-0 z-50 flex flex-col transition-all duration-300 ease-in-out lg:relative lg:z-auto"
        [class]="sidebarOpen() ? 'w-64 translate-x-0' : '-translate-x-full lg:translate-x-0 ' + (sidebarCollapsed() ? 'lg:w-20' : 'lg:w-64')"
      >
        <div class="flex flex-col h-full bg-gradient-to-b from-primary-900 via-primary-800 to-primary-900 text-white shadow-2xl">
          <!-- Logo -->
          <div class="flex items-center gap-3 px-5 py-6 border-b border-white/10">
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm text-lg font-bold shrink-0">
              M
            </div>
            @if (!sidebarCollapsed() || sidebarOpen()) {
              <div class="animate-fade-in">
                <h1 class="text-lg font-bold tracking-tight">MissionSupport</h1>
                <p class="text-xs text-primary-300">{{ 'dashboard.supportProgress' | translate }}</p>
              </div>
            }
          </div>

          <!-- Navigation -->
          <nav class="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            @for (item of navItems; track item.route) {
              <a
                [id]="'nav-' + item.id"
                [routerLink]="item.route"
                routerLinkActive="bg-white/20 shadow-lg text-white"
                [routerLinkActiveOptions]="{ exact: item.exact }"
                class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200 group"
                (click)="sidebarOpen.set(false)"
              >
                <div class="shrink-0 w-6 flex justify-center group-hover:scale-110 transition-transform">
                  @switch (item.id) {
                    @case ('dashboard') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                    }
                    @case ('supporters') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                    }
                    @case ('offerings') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                    }
                    @case ('calls') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                    }
                    @case ('reports') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    }
                    @case ('settings') {
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                    }
                  }
                </div>
                @if (!sidebarCollapsed() || sidebarOpen()) {
                  <span class="animate-fade-in">{{ item.label | translate }}</span>
                }
              </a>
            }
          </nav>

          <!-- User info -->
          <div class="p-4 border-t border-white/10">
            <div class="flex items-center gap-3">
              <div class="flex items-center justify-center w-9 h-9 rounded-full bg-primary-400/30 text-sm font-bold shrink-0">
                {{ getUserInitials() }}
              </div>
              @if (!sidebarCollapsed() || sidebarOpen()) {
                <div class="flex-1 min-w-0 animate-fade-in">
                  <p class="text-sm font-medium truncate">{{ auth.currentUser()?.name || 'User' }}</p>
                  <p class="text-xs text-primary-300 truncate">{{ auth.currentUser()?.email || '' }}</p>
                </div>
              }
            </div>
            <button
              id="btn-logout"
              (click)="auth.logout()"
              class="flex items-center gap-2 w-full mt-3 px-3 py-2 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/10 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
              @if (!sidebarCollapsed() || sidebarOpen()) {
                <span class="font-medium">{{ 'nav.logout' | translate }}</span>
              }
            </button>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <div class="flex-1 flex flex-col min-w-0 overflow-hidden">
        <!-- Header -->
        <header
          id="header"
          class="flex items-center justify-between gap-4 px-4 py-3 bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border-b border-white/20 dark:border-slate-700/50 shadow-sm lg:px-8"
        >
          <div class="flex items-center gap-4">
            <!-- Mobile menu button -->
            <button
              id="btn-menu-toggle"
              class="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              (click)="sidebarOpen.set(true)"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>

            <!-- Desktop sidebar toggle -->
            <button
              id="btn-sidebar-toggle"
              class="hidden lg:flex p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
              (click)="sidebarCollapsed.update(v => !v)"
            >
              <svg class="w-5 h-5 transition-transform" [class.rotate-180]="sidebarCollapsed()" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
              </svg>
            </button>
          </div>

          <div class="flex items-center gap-2">
            <!-- Language toggle -->
            <button
              id="btn-lang-toggle"
              (click)="i18n.toggleLanguage()"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-700/50 hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors"
            >
              <svg class="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"/></svg>
              <span>{{ i18n.currentLang() === 'pt-BR' ? 'PT' : 'EN' }}</span>
            </button>

            <!-- Theme toggle -->
            <button
              id="btn-theme-toggle"
              (click)="theme.toggle()"
              class="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
              @if (theme.isDark()) {
                <svg class="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clip-rule="evenodd"/>
                </svg>
              } @else {
                <svg class="w-5 h-5 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"/>
                </svg>
              }
            </button>

            <!-- User avatar -->
            <div
              id="header-avatar"
              class="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-white text-sm font-bold shadow-md"
            >
              {{ getUserInitials() }}
            </div>
          </div>
        </header>

        <!-- Page content -->
        <main id="main-content" class="flex-1 overflow-y-auto p-4 lg:p-8">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
})
export class Layout {
  protected readonly auth = inject(AuthService);
  protected readonly theme = inject(ThemeService);
  protected readonly i18n = inject(TranslationService);

  protected readonly sidebarOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);

  protected readonly navItems = [
    { id: 'dashboard', route: '/dashboard', label: 'nav.dashboard', exact: true },
    { id: 'supporters', route: '/supporters', label: 'nav.supporters', exact: false },
    { id: 'offerings', route: '/offerings', label: 'nav.offerings', exact: true },
    { id: 'calls', route: '/calls', label: 'nav.calls', exact: true },
    { id: 'reports', route: '/reports', label: 'nav.reports', exact: true },
    { id: 'settings', route: '/settings', label: 'nav.settings', exact: true },
  ];

  protected getUserInitials(): string {
    const name = this.auth.currentUser()?.name;
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
}
