import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-supporter-form',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="animate-fade-in max-w-4xl mx-auto space-y-6 pb-12">
      <!-- Header -->
      <div class="flex items-center space-x-4">
        <button (click)="goBack()" class="p-2 rounded-xl bg-white/80 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
          <svg class="w-5 h-5 text-slate-600 dark:text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
        </button>
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">
          {{ (isEdit() ? 'supporters.editTitle' : 'supporters.newTitle') | translate }}
        </h1>
      </div>

      <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6 md:p-8">
        <form #form="ngForm" (ngSubmit)="onSubmit(form)" class="space-y-8">
          
          <!-- Basic Info Section -->
          <div class="space-y-4">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              Informações Pessoais
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{{ 'supporters.name' | translate }} *</label>
                <input type="text" [(ngModel)]="model.name" name="name" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{{ 'supporters.type' | translate }}</label>
                <select [(ngModel)]="model.type" name="type" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none appearance-none">
                  <option value="individual">{{ 'supporters.types.individual' | translate }}</option>
                  <option value="couple">{{ 'supporters.types.couple' | translate }}</option>
                  <option value="church">{{ 'supporters.types.church' | translate }}</option>
                </select>
              </div>

              @if (model.type === 'couple') {
                <div class="animate-fade-in md:col-span-2">
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Nome do Cônjuge</label>
                  <input type="text" [(ngModel)]="model.partnerName" name="partnerName"
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
                </div>
              }

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{{ 'supporters.email' | translate }}</label>
                <input type="email" [(ngModel)]="model.email" name="email"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{{ 'supporters.phone' | translate }}</label>
                <input type="tel" [(ngModel)]="model.phone" name="phone"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data de Aniversário</label>
                <input type="date" [(ngModel)]="model.birthday" name="birthday"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
              </div>
            </div>
          </div>

          <!-- Status & Contribution Section -->
          <div class="space-y-4">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              Status e Contribuição
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{{ 'supporters.statusLabel' | translate }}</label>
                <select [(ngModel)]="model.status" name="status" 
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none appearance-none">
                  <option value="prospect">{{ 'supporters.status.prospect' | translate }}</option>
                  <option value="contacted">{{ 'supporters.status.contacted' | translate }}</option>
                  <option value="confirmed">{{ 'supporters.status.confirmed' | translate }}</option>
                  <option value="active">{{ 'supporters.status.active' | translate }}</option>
                  <option value="inactive">{{ 'supporters.status.inactive' | translate }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{{ 'supporters.estimatedOffering' | translate }}</label>
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span class="text-slate-500 dark:text-slate-400 font-medium">R$</span>
                  </div>
                  <input type="number" step="0.01" [(ngModel)]="model.estimatedOffering" name="estimatedOffering"
                    class="w-full pl-12 pr-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none font-mono">
                </div>
              </div>

              <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <input type="checkbox" id="hasResponded" [(ngModel)]="model.hasResponded" name="hasResponded"
                  class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 focus:ring-2 dark:bg-slate-800 dark:border-slate-600 border-slate-300 transition-colors">
                <label for="hasResponded" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Já obtive resposta se vai ser mantenedor?
                </label>
              </div>

              <div class="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <input type="checkbox" id="hasReturnedContact" [(ngModel)]="model.hasReturnedContact" name="hasReturnedContact"
                  class="w-5 h-5 text-primary-600 rounded focus:ring-primary-500 focus:ring-2 dark:bg-slate-800 dark:border-slate-600 border-slate-300 transition-colors">
                <label for="hasReturnedContact" class="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Já retornou o meu contato?
                </label>
              </div>
            </div>
          </div>

          <!-- Location Section -->
          <div class="space-y-4">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              Endereço
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Cidade</label>
                <input type="text" [(ngModel)]="model.city" name="city"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Estado</label>
                <input type="text" [(ngModel)]="model.state" name="state"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none">
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div class="space-y-4">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2">
              Observações
            </h2>
            
            <div>
              <textarea [(ngModel)]="model.notes" name="notes" rows="4"
                class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-slate-900 dark:text-white transition-all outline-none resize-y"
                placeholder="Informações adicionais..."></textarea>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button type="button" (click)="goBack()" 
              class="px-6 py-3 rounded-xl text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              {{ 'common.action.cancel' | translate }}
            </button>
            <button type="submit" [disabled]="form.invalid || isLoading()"
              class="px-8 py-3 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              @if(isLoading()) {
                Salvando...
              } @else {
                {{ 'common.action.save' | translate }}
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class SupporterFormComponent implements OnInit {
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private location = inject(Location);

  isEdit = signal(false);
  isLoading = signal(false);
  supporterId: string | null = null;

  model: any = {
    type: 'individual',
    status: 'prospect',
    hasResponded: false,
    hasReturnedContact: false,
    estimatedOffering: null
  };

  ngOnInit() {
    this.supporterId = this.route.snapshot.paramMap.get('id');
    if (this.supporterId) {
      this.isEdit.set(true);
      this.loadSupporter();
    }
  }

  loadSupporter() {
    this.isLoading.set(true);
    this.api.get<any>(`/supporters/${this.supporterId}`).subscribe({
      next: (data) => {
        // format date for input if exists
        if (data.birthday) {
          data.birthday = data.birthday.substring(0, 10);
        }
        this.model = data;
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;

    this.isLoading.set(true);
    const request = this.isEdit() 
      ? this.api.put(`/supporters/${this.supporterId}`, this.model)
      : this.api.post('/supporters', this.model);

    request.subscribe({
      next: () => {
        this.isLoading.set(false);
        this.goBack();
      },
      error: () => {
        this.isLoading.set(false);
        alert('Erro ao salvar');
      }
    });
  }

  goBack() {
    this.location.back();
  }
}
