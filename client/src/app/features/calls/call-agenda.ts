import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-call-agenda',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule],
  template: `
    <div class="animate-fade-in space-y-6 relative">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">{{ 'calls.title' | translate }}</h1>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngFor="let call of pendingCalls()" class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6 hover:scale-[1.02] transition-transform">
          <div class="flex justify-between items-start mb-4">
            <div class="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center text-primary-600 dark:text-primary-300 font-bold text-xl">
              {{ call.name.charAt(0) }}
            </div>
            <span class="bg-warning/10 text-warning px-2 py-1 rounded-md text-xs font-medium">{{ 'calls.pending' | translate }}</span>
          </div>
          
          <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">{{ call.name }}</h2>
          <p class="text-slate-500 dark:text-slate-400 text-sm mb-6">{{ call.phone || 'Sem telefone' }}</p>
          
          <div class="flex space-x-2">
            <button (click)="openWhatsapp(call)" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-xl transition-colors text-sm font-medium shadow-lg shadow-green-500/30">
              WhatsApp
            </button>
            <button (click)="openModal(call)" class="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-xl transition-colors text-sm font-medium shadow-lg shadow-primary-500/30">
              {{ 'calls.register' | translate }}
            </button>
          </div>
        </div>
      </div>
      
      <div *ngIf="pendingCalls().length === 0" class="text-center py-12 text-slate-500 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-white/20 dark:border-slate-700/50">
        {{ 'dashboard.noPendingCalls' | translate }}
      </div>

      <!-- Quick Register Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up border border-slate-200 dark:border-slate-700">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Registrar Contato</h2>
            <p class="text-sm text-slate-500 dark:text-slate-400 mb-6">
              Como foi o contato com <strong class="text-slate-700 dark:text-slate-200">{{ selectedCall()?.name }}</strong>?
            </p>

            <form (ngSubmit)="saveContact()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data do Contato</label>
                <input type="date" [(ngModel)]="modalDate" name="date" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white">
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Tipo de Contato</label>
                <select [(ngModel)]="modalType" name="type" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none appearance-none text-slate-900 dark:text-white">
                  <option value="call">Ligação</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">E-mail</option>
                  <option value="in_person">Presencial</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Observações sobre a conversa</label>
                <textarea [(ngModel)]="modalNotes" name="notes" rows="3"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white"></textarea>
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" (click)="closeModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="!modalDate || !modalType || isSaving()" class="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50">
                  {{ isSaving() ? 'Salvando...' : 'Salvar Contato' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class CallAgendaComponent implements OnInit {
  private api = inject(ApiService);
  
  pendingCalls = signal<any[]>([]);

  showModal = signal(false);
  selectedCall = signal<any>(null);
  isSaving = signal(false);

  modalDate = '';
  modalType = 'call';
  modalNotes = '';

  ngOnInit() {
    this.loadPendingCalls();
  }

  loadPendingCalls() {
    this.api.get<{pendingCalls: any[]}>('/dashboard/pending-calls')
      .subscribe({
        next: (res) => this.pendingCalls.set(res.pendingCalls || []),
        error: () => this.pendingCalls.set([])
      });
  }

  openWhatsapp(call: any) {
    if (call.phone) {
      const cleanPhone = call.phone.replace(/\D/g, '');
      window.open(`https://wa.me/55${cleanPhone}`, '_blank');
    } else {
      alert('Mantenedor não possui telefone cadastrado.');
    }
  }

  openModal(call: any) {
    this.selectedCall.set(call);
    this.modalDate = new Date().toISOString().split('T')[0];
    this.modalType = 'call';
    this.modalNotes = '';
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedCall.set(null);
  }

  saveContact() {
    const call = this.selectedCall();
    if (!call) return;

    this.isSaving.set(true);

    const payload = {
      supporterId: call.id,
      contactType: this.modalType,
      contactDate: this.modalDate,
      notes: this.modalNotes,
      supporterInitiated: false
    };

    this.api.post('/contacts', payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.closeModal();
        this.loadPendingCalls(); // Refresh list
      },
      error: () => {
        this.isSaving.set(false);
        alert('Erro ao registrar contato');
      }
    });
  }
}
