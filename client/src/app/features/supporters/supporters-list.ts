import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-supporters-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule, RouterLink],
  template: `
    <div class="animate-fade-in space-y-6">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ 'supporters.title' | translate }}</h1>
        <a routerLink="/supporters/new" class="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-primary-500/30">
          + {{ 'supporters.add' | translate }}
        </a>
      </div>

      <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4">
          <input type="text" [placeholder]="'common.action.search' | translate" [(ngModel)]="search" (ngModelChange)="loadSupporters()" class="flex-1 min-w-[200px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
          
          <select [(ngModel)]="statusFilter" (ngModelChange)="loadSupporters()" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">{{ 'supporters.status.all' | translate }}</option>
            <option value="active">{{ 'supporters.status.active' | translate }}</option>
            <option value="prospect">{{ 'supporters.status.prospect' | translate }}</option>
            <option value="inactive">{{ 'supporters.status.inactive' | translate }}</option>
          </select>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
                <th class="p-4 font-medium">{{ 'supporters.name' | translate }}</th>
                <th class="p-4 font-medium">{{ 'supporters.type' | translate }}</th>
                <th class="p-4 font-medium">{{ 'supporters.statusLabel' | translate }}</th>
                <th class="p-4 font-medium">{{ 'supporters.estimatedOffering' | translate }}</th>
                <th class="p-4 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let s of supporters()" class="border-t border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors group">
                <td class="p-4">
                  <div class="flex items-center space-x-3">
                    <div class="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold">
                      {{ s.name.charAt(0) }}
                    </div>
                    <div>
                      <p class="font-medium text-slate-800 dark:text-slate-200">
                        {{ s.name }}
                        <span *ngIf="s.partnerName" class="text-sm text-slate-500 font-normal"> e {{ s.partnerName }}</span>
                      </p>
                      <p class="text-xs text-slate-500">{{ s.email || s.phone }}</p>
                    </div>
                  </div>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                    [ngClass]="{
                      'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300': s.type === 'individual',
                      'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300': s.type === 'couple',
                      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300': s.type === 'church'
                    }">
                    {{ 'supporters.types.' + s.type | translate }}
                  </span>
                </td>
                <td class="p-4">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                    [ngClass]="{
                      'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300': s.status === 'active',
                      'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300': s.status === 'prospect',
                      'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300': s.status === 'confirmed',
                      'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300': s.status === 'inactive'
                    }">
                    {{ 'supporters.status.' + s.status | translate }}
                  </span>
                </td>
                <td class="p-4 font-mono text-slate-700 dark:text-slate-300">
                  R$ {{ s.estimatedOffering | number:'1.2-2' }}
                </td>
                <td class="p-4 text-right flex justify-end gap-3">
                  <a [routerLink]="['/supporters', s.id]" class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Detalhes
                  </a>
                  <a [routerLink]="['/supporters', s.id, 'edit']" class="text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {{ 'common.action.edit' | translate }}
                  </a>
                </td>
              </tr>
              <tr *ngIf="supporters().length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500">
                  {{ 'supporters.noResults' | translate }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class SupportersListComponent implements OnInit {
  private api = inject(ApiService);
  
  supporters = signal<any[]>([]);
  search = '';
  statusFilter = '';

  ngOnInit() {
    this.loadSupporters();
  }

  loadSupporters() {
    let url = '/supporters?';
    if (this.search) url += `search=${encodeURIComponent(this.search)}&`;
    if (this.statusFilter) url += `status=${this.statusFilter}`;
    
    this.api.get<any>(url).subscribe(res => {
      this.supporters.set(res.supporters || res);
    });
  }
}
