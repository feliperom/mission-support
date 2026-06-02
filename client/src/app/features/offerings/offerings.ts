import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-offerings',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  template: `
    <div class="animate-fade-in space-y-6 relative">
      <div class="flex justify-between items-center">
        <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ 'offerings.title' | translate }}</h1>
        <button (click)="openNewOfferingModal()" class="inline-block bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-xl transition-colors font-medium shadow-lg shadow-primary-500/30">
          + Cadastrar Oferta
        </button>
      </div>

      <div class="flex items-center justify-between">
        <div></div>
        <div class="flex items-center space-x-4">
          <button (click)="prevMonth()" class="p-2 bg-white dark:bg-slate-800 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">→</button>
          <!-- Using arrows depending on locale, let's just use standard left/right -->
          <button (click)="prevMonth()" class="p-2 bg-white dark:bg-slate-800 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <span class="font-medium text-lg text-slate-800 dark:text-slate-200">{{ monthStr() }}</span>
          <button (click)="nextMonth()" class="p-2 bg-white dark:bg-slate-800 rounded-lg shadow hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>
      </div>

      <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl overflow-hidden">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-sm">
              <th class="p-4 font-medium">{{ 'supporters.name' | translate }}</th>
              <th class="p-4 font-medium">{{ 'supporters.estimatedOffering' | translate }}</th>
              <th class="p-4 font-medium">{{ 'offerings.status' | translate }}</th>
              <th class="p-4 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let item of items()" class="border-t border-slate-100 dark:border-slate-700/50 transition-colors">
              <td class="p-4 font-medium text-slate-800 dark:text-slate-200">{{ item.supporterName || item.supporter?.name }}</td>
              <td class="p-4 font-mono">R$ {{ (item.amount || item.supporter?.estimatedOffering) | number:'1.2-2' }}</td>
              <td class="p-4">
                <span class="px-3 py-1 rounded-full text-xs font-medium"
                  [ngClass]="item.isReceived ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'">
                  {{ item.isReceived ? ('offerings.received' | translate) : ('offerings.pending' | translate) }}
                </span>
              </td>
              <td class="p-4 text-right">
                <button *ngIf="!item.isReceived" (click)="openModal(item)" class="text-sm bg-primary-100 text-primary-700 hover:bg-primary-200 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-800/60 px-3 py-1 rounded-lg transition-colors font-medium">
                  {{ 'common.action.markReceived' | translate }}
                </button>
              </td>
            </tr>
            <tr *ngIf="items().length === 0">
              <td colspan="4" class="p-8 text-center text-slate-500">
                Nenhuma oferta esperada para este mês.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Quick Register Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up border border-slate-200 dark:border-slate-700">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Registrar Oferta</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Confirmar o recebimento da oferta de <strong class="text-slate-700 dark:text-slate-200">{{ selectedItem()?.supporterName || selectedItem()?.supporter?.name }}</strong> referente a {{ monthStr() }}.
            </p>

            <form (ngSubmit)="confirmReceived()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor Recebido (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="modalAmount" name="amount" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-slate-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data do Recebimento</label>
                <input type="date" [(ngModel)]="modalDate" name="date" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações (opcional)</label>
                <textarea [(ngModel)]="modalNotes" name="notes" rows="2"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"></textarea>
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" (click)="closeModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="!modalAmount || !modalDate || isSaving()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50">
                  {{ isSaving() ? 'Salvando...' : 'Confirmar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
      <!-- New Offering Modal -->
      @if (showNewOfferingModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up border border-slate-200 dark:border-slate-700">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Cadastrar Nova Oferta</h2>
            
            <form (ngSubmit)="saveNewOffering()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Apoiador (Nome)</label>
                <input type="text" [(ngModel)]="newOfferingSupporterName" name="supporterName" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"
                  placeholder="Nome do apoiador">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="modalAmount" name="amount" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-slate-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data da Oferta</label>
                <input type="date" [(ngModel)]="modalDate" name="date" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações (opcional)</label>
                <textarea [(ngModel)]="modalNotes" name="notes" rows="2"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"></textarea>
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" (click)="closeNewOfferingModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="!newOfferingSupporterName || !modalAmount || !modalDate || isSaving()" class="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-lg shadow-emerald-500/30 transition-all disabled:opacity-50">
                  {{ isSaving() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class OfferingsComponent implements OnInit {
  private api = inject(ApiService);
  
  items = signal<any[]>([]);
  currentDate = new Date();
  monthStr = signal('');

  showModal = signal(false);
  selectedItem = signal<any>(null);
  isSaving = signal(false);
  
  modalAmount = '';
  modalDate = '';
  modalNotes = '';

  showNewOfferingModal = signal(false);
  activeSupporters = signal<any[]>([]);
  newOfferingSupporterName = '';

  ngOnInit() {
    this.updateMonthStr();
    this.loadOfferings();
    this.loadActiveSupporters();
  }

  loadActiveSupporters() {
    this.api.get<any>('/supporters?status=active').subscribe({
      next: (res) => this.activeSupporters.set(res.supporters || res)
    });
  }

  updateMonthStr() {
    const m = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
    this.monthStr.set(m);
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateMonthStr();
    this.loadOfferings();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateMonthStr();
    this.loadOfferings();
  }

  loadOfferings() {
    const [year, month] = this.monthStr().split('-');
    // The backend endpoint GET /api/offerings/monthly-check returns expected offerings
    // with isReceived true/false
    this.api.get<any>(`/offerings/monthly-check?month=${this.monthStr()}`).subscribe({
      next: (res) => {
        this.items.set(res || []);
      },
      error: () => this.items.set([])
    });
  }

  openModal(item: any) {
    this.selectedItem.set(item);
    this.modalAmount = item.amount || item.supporter?.estimatedOffering || '';
    this.modalDate = new Date().toISOString().split('T')[0];
    this.modalNotes = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedItem.set(null);
  }

  openNewOfferingModal() {
    this.newOfferingSupporterName = '';
    this.modalAmount = '';
    this.modalDate = new Date().toISOString().split('T')[0];
    this.modalNotes = '';
    this.showNewOfferingModal.set(true);
  }

  closeNewOfferingModal() {
    this.showNewOfferingModal.set(false);
  }

  saveNewOffering() {
    this.isSaving.set(true);
    const d = new Date(this.modalDate);
    const monthReference = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    
    const payload = {
      supporterName: this.newOfferingSupporterName,
      amount: this.modalAmount,
      offeringDate: this.modalDate,
      monthReference: monthReference,
      isReceived: true,
      notes: this.modalNotes
    };

    this.api.post('/offerings', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeNewOfferingModal();
        this.loadOfferings(); // reload current view
      },
      error: () => {
        this.isSaving.set(false);
        alert('Erro ao registrar oferta');
      }
    });
  }

  confirmReceived() {
    const item = this.selectedItem();
    if (!item) return;

    this.isSaving.set(true);
    
    // In our backend, POST /api/offerings creates the offering record
    // The monthly-check returns virtual rows for missing ones, and real rows for received
    const payload = {
      supporterId: item.supporterId || item.supporter?.id || item.id, // Depends on how backend returns it
      amount: this.modalAmount,
      offeringDate: this.modalDate,
      monthReference: this.monthStr(),
      isReceived: true,
      notes: this.modalNotes
    };

    // Correct the supporterId resolution
    if (!payload.supporterId && item.supporter) payload.supporterId = item.supporter.id;
    if (!payload.supporterId) payload.supporterId = item.id; // if the item itself is the supporter

    this.api.post('/offerings', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadOfferings();
      },
      error: () => {
        this.isSaving.set(false);
        alert('Erro ao registrar oferta');
      }
    });
  }
}
