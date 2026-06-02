import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';

interface DashboardSummary {
  goal: number;
  received: number;
  achievedPercent: number;
  totalExpenses?: number;
  netIncome?: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="animate-fade-in space-y-6">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ 'dashboard.title' | translate }}</h1>
      
      <!-- Progress Bar -->
      <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
        <h2 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">{{ 'dashboard.supportProgress' | translate }}</h2>
        <div class="flex justify-between text-sm font-mono mb-2 text-slate-600 dark:text-slate-400">
          <span>R$ {{ summary().received | number:'1.2-2' }}</span>
          <span>R$ {{ summary().goal | number:'1.2-2' }}</span>
        </div>
        <div class="h-4 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div 
            class="h-full bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500 transition-all duration-1000 ease-out"
            [style.width.%]="summary().achievedPercent > 100 ? 100 : summary().achievedPercent">
          </div>
        </div>
        <p class="text-right text-xs mt-1 text-slate-500">{{ summary().achievedPercent }}%</p>
      </div>

      <!-- KPI Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Current Support -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5 hover:scale-[1.02] transition-transform">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'dashboard.currentSupport' | translate }}</p>
          <p class="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400 mt-1">R$ {{ summary().received | number:'1.2-2' }}</p>
        </div>

        <!-- Total Expenses -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5 hover:scale-[1.02] transition-transform">
          <p class="text-sm text-slate-500 dark:text-slate-400">Despesas Totais</p>
          <p class="text-2xl font-mono font-bold text-danger mt-1">R$ {{ summary().totalExpenses || 0 | number:'1.2-2' }}</p>
        </div>

        <!-- Net Income -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5 hover:scale-[1.02] transition-transform">
          <p class="text-sm text-slate-500 dark:text-slate-400">Líquido</p>
          <p class="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">R$ {{ summary().netIncome || 0 | number:'1.2-2' }}</p>
        </div>

        <!-- Monthly Goal -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5 hover:scale-[1.02] transition-transform">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'dashboard.monthlyGoal' | translate }}</p>
          <p class="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100 mt-1">R$ {{ summary().goal | number:'1.2-2' }}</p>
        </div>

        <!-- Active Supporters -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5 hover:scale-[1.02] transition-transform">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'dashboard.activeSupporters' | translate }}</p>
          <p class="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">{{ counts()['active'] || 0 }}</p>
        </div>

        <!-- Pending Calls -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5 hover:scale-[1.02] transition-transform">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'dashboard.pendingCalls' | translate }}</p>
          <p class="text-2xl font-mono font-bold text-warning mt-1">{{ pendingCalls().length }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Birthdays this week -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
          <h2 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">{{ 'dashboard.birthdays' | translate }}</h2>
          <div *ngIf="birthdays().length === 0" class="text-slate-500 text-sm">
            {{ 'dashboard.noBirthdays' | translate }}
          </div>
          <ul class="space-y-3">
            <li *ngFor="let b of birthdays()" class="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                {{ b.name.charAt(0) }}
              </div>
              <div>
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ b.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ b.birthday | date:'dd/MM' }}</p>
              </div>
            </li>
          </ul>
        </div>

        <!-- Pending Calls List -->
        <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
          <h2 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">{{ 'dashboard.callsToMake' | translate }}</h2>
          <div *ngIf="pendingCalls().length === 0" class="text-slate-500 text-sm">
            {{ 'dashboard.noPendingCalls' | translate }}
          </div>
          <ul class="space-y-3">
            <li *ngFor="let call of pendingCalls().slice(0, 5)" class="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <div>
                <p class="font-medium text-slate-800 dark:text-slate-200">{{ call.name }}</p>
                <p class="text-xs text-slate-500 dark:text-slate-400">{{ call.phone || 'Sem telefone' }}</p>
              </div>
              <button class="px-3 py-1 bg-primary-100 hover:bg-primary-200 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-800/60 rounded-lg text-sm transition-colors">
                {{ 'common.action.contact' | translate }}
              </button>
            </li>
          </ul>
          <div class="mt-4 text-center" *ngIf="pendingCalls().length > 5">
            <a href="/calls" class="text-sm text-primary-600 hover:text-primary-700 dark:text-primary-400">
              Ver todos ({{ pendingCalls().length }})
            </a>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  
  summary = signal<DashboardSummary>({ goal: 0, received: 0, achievedPercent: 0 });
  counts = signal<Record<string, number>>({});
  birthdays = signal<any[]>([]);
  pendingCalls = signal<any[]>([]);

  ngOnInit() {
    this.api.get<{summary: DashboardSummary, counts: Record<string, number>}>('/dashboard/summary')
      .subscribe(res => {
        this.summary.set(res.summary);
        this.counts.set(res.counts);
      });

    this.api.get<{birthdays: any[]}>('/dashboard/birthdays')
      .subscribe(res => this.birthdays.set(res.birthdays));

    this.api.get<{pendingCalls: any[]}>('/dashboard/pending-calls')
      .subscribe(res => this.pendingCalls.set(res.pendingCalls));
  }
}
