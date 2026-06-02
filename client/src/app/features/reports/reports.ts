import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  template: `
    <div class="animate-fade-in space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ 'reports.title' | translate }}</h1>
        <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-primary-500/30 flex items-center space-x-2">
          <span>{{ 'reports.exportPdf' | translate }}</span>
        </button>
      </div>

      <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
        <div class="flex space-x-4 mb-6">
          <input type="month" [(ngModel)]="selectedMonth" (ngModelChange)="loadReport()" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
        </div>

        <div *ngIf="reportData() as report" class="space-y-8">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'dashboard.monthlyGoal' | translate }} / {{ 'reports.expected' | translate }}</p>
              <p class="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100 mt-1">R$ {{ report.summary.totalExpected | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-emerald-500/30">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'reports.received' | translate }}</p>
              <p class="text-2xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">R$ {{ report.summary.totalReceived | number:'1.2-2' }}</p>
            </div>
            <div class="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-red-500/30">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'reports.missing' | translate }}</p>
              <p class="text-2xl font-mono font-bold text-red-600 dark:text-red-400 mt-1">R$ {{ report.summary.totalMissing | number:'1.2-2' }}</p>
            </div>
          </div>
          
          <div>
            <h3 class="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">{{ 'offerings.title' | translate }}</h3>
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-sm">
                  <th class="p-3 rounded-l-lg font-medium">{{ 'supporters.name' | translate }}</th>
                  <th class="p-3 font-medium">{{ 'offerings.amount' | translate }}</th>
                  <th class="p-3 rounded-r-lg font-medium">{{ 'offerings.status' | translate }}</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let o of report.offerings" class="border-b border-slate-100 dark:border-slate-700/50">
                  <td class="p-3">{{ o.supporterName }}</td>
                  <td class="p-3 font-mono">R$ {{ o.amount | number:'1.2-2' }}</td>
                  <td class="p-3">
                    <span [ngClass]="o.isReceived ? 'text-emerald-600' : 'text-red-600'">
                      {{ o.isReceived ? ('offerings.received' | translate) : ('offerings.pending' | translate) }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReportsComponent implements OnInit {
  private api = inject(ApiService);
  
  selectedMonth = '';
  reportData = signal<any>(null);

  ngOnInit() {
    const today = new Date();
    this.selectedMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
    this.loadReport();
  }

  loadReport() {
    if (!this.selectedMonth) return;
    const [year, month] = this.selectedMonth.split('-');
    
    this.api.get<any>(`/reports/monthly/${year}/${month}`).subscribe({
      next: (res) => {
        if(res && res.report) {
          this.reportData.set(res.report);
        }
      },
      error: () => this.reportData.set(null)
    });
  }
}
