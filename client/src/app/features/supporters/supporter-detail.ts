import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-supporter-detail',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RouterModule],
  template: `
    <div class="animate-fade-in space-y-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center space-x-4">
          <a routerLink="/supporters" class="p-2 bg-white dark:bg-slate-800 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500">←</a>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ supporter()?.name || ('common.loading' | translate) }}</h1>
        </div>
        <button class="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-primary-500/30">
          {{ 'common.action.edit' | translate }}
        </button>
      </div>

      <div *ngIf="supporter() as s" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div class="lg:col-span-1 space-y-6">
          <!-- Profile Card -->
          <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
            <div class="flex items-center space-x-4 mb-6">
              <div class="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-2xl">
                {{ s.name.charAt(0) }}
              </div>
              <div>
                <span class="px-2 py-1 text-xs rounded-full font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                  {{ 'supporters.status.' + s.status | translate }}
                </span>
                <p class="text-slate-500 dark:text-slate-400 mt-1">{{ 'supporters.types.' + s.type | translate }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'supporters.email' | translate }}</p>
                <p class="text-slate-800 dark:text-slate-200">{{ s.email || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'supporters.phone' | translate }}</p>
                <p class="text-slate-800 dark:text-slate-200">{{ s.phone || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'supporters.city' | translate }} / {{ 'supporters.state' | translate }}</p>
                <p class="text-slate-800 dark:text-slate-200">{{ s.city || '-' }} / {{ s.state || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'supporters.birthday' | translate }}</p>
                <p class="text-slate-800 dark:text-slate-200">{{ (s.birthday | date:'dd/MM/yyyy') || '-' }}</p>
              </div>
              <div>
                <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'supporters.estimatedOffering' | translate }}</p>
                <p class="font-mono text-lg text-slate-800 dark:text-slate-200">R$ {{ s.estimatedOffering | number:'1.2-2' }}</p>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-2 space-y-6">
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-lg rounded-2xl p-5">
              <p class="text-sm text-slate-500 dark:text-slate-400">{{ 'supporters.totalGiven' | translate }}</p>
              <p class="text-2xl font-mono font-bold text-primary-600 dark:text-primary-400 mt-1">R$ {{ totalGiven() | number:'1.2-2' }}</p>
            </div>
          </div>

          <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
            <h2 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">{{ 'supporters.offeringHistory' | translate }}</h2>
            <div class="space-y-3">
              <div *ngFor="let o of offerings()" class="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div>
                  <p class="font-medium text-slate-800 dark:text-slate-200">{{ o.monthReference }}</p>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ o.offeringDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <div class="text-right">
                  <p class="font-mono font-bold text-emerald-600 dark:text-emerald-400">R$ {{ o.amount | number:'1.2-2' }}</p>
                </div>
              </div>
              <p *ngIf="offerings().length === 0" class="text-slate-500 text-sm">Sem histórico.</p>
            </div>
          </div>

          <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
            <h2 class="text-lg font-medium text-slate-700 dark:text-slate-300 mb-4">{{ 'supporters.contactHistory' | translate }}</h2>
            <div class="space-y-3">
              <div *ngFor="let c of contacts()" class="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div class="flex justify-between items-center mb-2">
                  <span class="px-2 py-1 text-xs rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium uppercase">{{ c.contactType }}</span>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ c.contactDate | date:'dd/MM/yyyy' }}</p>
                </div>
                <p class="text-sm text-slate-700 dark:text-slate-300">{{ c.notes || '-' }}</p>
              </div>
              <p *ngIf="contacts().length === 0" class="text-slate-500 text-sm">Sem histórico.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  `
})
export class SupporterDetailComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);

  supporter = signal<any>(null);
  offerings = signal<any[]>([]);
  contacts = signal<any[]>([]);
  totalGiven = signal<number>(0);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.get<any>(`/supporters/${id}`).subscribe(res => {
        this.supporter.set(res.supporter);
        this.offerings.set(res.offerings || []);
        this.contacts.set(res.contacts || []);
        
        const total = (res.offerings || []).reduce((acc: number, curr: any) => acc + parseFloat(curr.amount), 0);
        this.totalGiven.set(total);
      });
    }
  }
}
