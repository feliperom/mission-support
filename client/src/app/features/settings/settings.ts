import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  template: `
    <div class="animate-fade-in max-w-5xl mx-auto space-y-6 pb-12">
      <h1 class="text-3xl font-bold text-slate-900 dark:text-white">Configurações</h1>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: General Settings -->
        <div class="space-y-6">
          <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
              Geral
            </h2>
            
            <form (ngSubmit)="saveGoal()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Meta Mensal (R$)</label>
                <input type="number" step="0.01" [(ngModel)]="monthlyGoal" name="goal" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-slate-900 dark:text-white transition-all">
              </div>
              <button type="submit" [disabled]="isSavingGoal()" class="w-full py-3 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-medium shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50">
                {{ isSavingGoal() ? 'Salvando...' : 'Salvar Meta' }}
              </button>
            </form>
          </div>
        </div>

        <!-- Right Column: Expenses -->
        <div class="lg:col-span-2 space-y-6">
          <div class="bg-white/80 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-white/10 shadow-xl rounded-2xl p-6">
            <div class="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">
              <h2 class="text-xl font-bold text-slate-800 dark:text-slate-200">
                Despesas Mensais
              </h2>
              <div class="flex items-center space-x-2">
                <button (click)="prevMonth()" class="p-1.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
                </button>
                <span class="font-medium text-sm text-slate-800 dark:text-slate-200 w-16 text-center">{{ monthStr() }}</span>
                <button (click)="nextMonth()" class="p-1.5 bg-slate-100 dark:bg-slate-700 rounded hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
            </div>

            <button (click)="openExpenseModal()" class="mb-4 inline-flex items-center gap-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 px-4 py-2 rounded-xl transition-colors font-medium text-sm">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
              Adicionar Despesa
            </button>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                    <th class="p-3 font-medium">Data</th>
                    <th class="p-3 font-medium">Descrição</th>
                    <th class="p-3 font-medium">Categoria</th>
                    <th class="p-3 font-medium text-right">Valor</th>
                    <th class="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let exp of expenses()" class="border-t border-slate-100 dark:border-slate-700/50 transition-colors group">
                    <td class="p-3 text-sm text-slate-600 dark:text-slate-300">{{ exp.expenseDate | date:'shortDate' }}</td>
                    <td class="p-3 text-sm text-slate-800 dark:text-slate-200">{{ exp.description }}</td>
                    <td class="p-3 text-sm text-slate-500 dark:text-slate-400">{{ exp.category || '-' }}</td>
                    <td class="p-3 text-sm text-right font-mono font-medium text-danger">R$ {{ exp.amount | number:'1.2-2' }}</td>
                    <td class="p-3 text-right">
                      <button (click)="deleteExpense(exp.id)" class="text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </td>
                  </tr>
                  <tr *ngIf="expenses().length === 0">
                    <td colspan="5" class="p-6 text-center text-slate-500 text-sm">Nenhuma despesa registrada neste mês.</td>
                  </tr>
                </tbody>
              </table>
            </div>
            
            <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center text-slate-800 dark:text-slate-200">
              <span class="font-medium">Total de Despesas:</span>
              <span class="font-bold font-mono text-lg text-danger">R$ {{ totalExpenses() | number:'1.2-2' }}</span>
            </div>

          </div>
        </div>
      </div>

      <!-- Expense Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 animate-slide-up border border-slate-200 dark:border-slate-700">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white mb-4">Nova Despesa</h2>
            
            <form (ngSubmit)="saveExpense()" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Descrição</label>
                <input type="text" [(ngModel)]="newExpense.description" name="description" required
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white">
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Valor (R$)</label>
                  <input type="number" step="0.01" [(ngModel)]="newExpense.amount" name="amount" required
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none font-mono text-slate-900 dark:text-white">
                </div>

                <div>
                  <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Data</label>
                  <input type="date" [(ngModel)]="newExpense.expenseDate" name="expenseDate" required
                    class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white">
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Categoria (Opcional)</label>
                <input type="text" [(ngModel)]="newExpense.category" name="category" placeholder="Ex: Transporte, Alimentação"
                  class="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-primary-500 outline-none text-slate-900 dark:text-white">
              </div>

              <div class="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                <button type="button" (click)="closeModal()" class="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                  Cancelar
                </button>
                <button type="submit" [disabled]="!newExpense.description || !newExpense.amount || !newExpense.expenseDate || isSavingExpense()" class="flex-1 py-2.5 rounded-xl bg-danger hover:bg-red-700 text-white font-medium shadow-lg shadow-red-500/30 transition-all disabled:opacity-50">
                  {{ isSavingExpense() ? 'Salvando...' : 'Salvar' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      }
    </div>
  `
})
export class SettingsComponent implements OnInit {
  private api = inject(ApiService);

  monthlyGoal: string = '';
  isSavingGoal = signal(false);

  currentDate = new Date();
  monthStr = signal('');
  expenses = signal<any[]>([]);
  totalExpenses = signal<number>(0);

  showModal = signal(false);
  isSavingExpense = signal(false);
  newExpense = {
    description: '',
    amount: '',
    expenseDate: '',
    category: ''
  };

  ngOnInit() {
    this.loadSettings();
    this.updateMonthStr();
    this.loadExpenses();
  }

  loadSettings() {
    this.api.get<any>('/settings').subscribe({
      next: (res) => {
        this.monthlyGoal = res.monthlyGoal || '0';
      }
    });
  }

  saveGoal() {
    this.isSavingGoal.set(true);
    this.api.put('/settings', { monthlyGoal: this.monthlyGoal }).subscribe({
      next: () => {
        this.isSavingGoal.set(false);
        // Optional: show toast notification
      },
      error: () => {
        this.isSavingGoal.set(false);
        alert('Erro ao salvar meta');
      }
    });
  }

  updateMonthStr() {
    const m = `${this.currentDate.getFullYear()}-${String(this.currentDate.getMonth() + 1).padStart(2, '0')}`;
    this.monthStr.set(m);
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.updateMonthStr();
    this.loadExpenses();
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.updateMonthStr();
    this.loadExpenses();
  }

  loadExpenses() {
    this.api.get<any[]>(`/expenses?month=${this.monthStr()}`).subscribe({
      next: (res) => {
        this.expenses.set(res);
        const total = res.reduce((acc, curr) => acc + parseFloat(curr.amount || '0'), 0);
        this.totalExpenses.set(total);
      }
    });
  }

  openExpenseModal() {
    this.newExpense = {
      description: '',
      amount: '',
      expenseDate: new Date().toISOString().split('T')[0],
      category: ''
    };
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  saveExpense() {
    this.isSavingExpense.set(true);
    this.api.post('/expenses', this.newExpense).subscribe({
      next: () => {
        this.isSavingExpense.set(false);
        this.closeModal();
        this.loadExpenses();
      },
      error: () => {
        this.isSavingExpense.set(false);
        alert('Erro ao registrar despesa');
      }
    });
  }

  deleteExpense(id: string) {
    if (confirm('Deseja realmente remover esta despesa?')) {
      this.api.delete(`/expenses/${id}`).subscribe({
        next: () => this.loadExpenses()
      });
    }
  }
}
