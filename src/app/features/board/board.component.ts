import { Component, inject, signal, computed, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TaskService } from '../../core/services/task.service';
import { AuthService } from '../../core/services/auth.service';
import { TaskCardComponent } from './components/task-card.component';
import { TaskFormComponent } from './components/task-form.component';
import {
  Task,
  TaskFormData,
  TaskStatus,
  TaskOwner,
  TaskSource,
  STATUS_CONFIG,
  OWNER_LABELS,
  SOURCE_LABELS,
  CATEGORY_LABELS,
  PRIORITY_CONFIG
} from '../../core/models/task.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent, TaskFormComponent],
  template: `
    <div class="min-h-screen bg-[#FAFAFA]">
      <!-- Header -->
      <header class="bg-white border-b border-gray-100">
        <div class="max-w-5xl mx-auto px-6 py-5">
          <!-- Top Row -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <div>
                <h1 class="text-lg font-semibold text-gray-900 tracking-tight">Wochen-Board</h1>
                <p class="text-xs text-gray-400 mt-0.5">Landerer Energie · {{ weekLabel }}</p>
              </div>
            </div>

            <!-- Header Actions -->
            <div class="flex items-center gap-2">
              <button
                (click)="exportForManuel()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                </svg>
                Export
              </button>
              <button
                (click)="print()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
                </svg>
                Drucken
              </button>
              <div class="w-px h-5 bg-gray-200 mx-1"></div>
              <button
                (click)="logout()"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>

          <!-- Stats Row -->
          <div class="flex items-center gap-8 mt-5 pt-5 border-t border-gray-100">
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-gray-900">{{ stats().total }}</span>
              <span class="text-sm text-gray-400">Aktiv</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-amber-500">{{ stats().inProgress }}</span>
              <span class="text-sm text-gray-400">In Arbeit</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-purple-500">{{ stats().waiting }}</span>
              <span class="text-sm text-gray-400">Wartend</span>
            </div>
            <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold text-red-500">{{ stats().urgent }}</span>
              <span class="text-sm text-gray-400">Dringend</span>
            </div>
            <div class="flex-1"></div>
            <button
              (click)="taskForm.open()"
              class="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Neue Aufgabe
            </button>
          </div>
        </div>
      </header>

      <!-- Filter Bar -->
      <div class="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div class="max-w-5xl mx-auto px-6 py-3">
          <div class="flex items-center gap-3">
            <span class="text-xs font-medium text-gray-400 uppercase tracking-wide">Filter:</span>
            <select
              [(ngModel)]="filterSource"
              (ngModelChange)="applyFilters()"
              class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-gray-300 focus:ring-0 outline-none"
            >
              <option value="alle">Alle Quellen</option>
              @for (src of sourceOptions; track src.value) {
                <option [value]="src.value">{{ src.label }}</option>
              }
            </select>
            <select
              [(ngModel)]="filterOwner"
              (ngModelChange)="applyFilters()"
              class="px-3 py-1.5 rounded-lg border border-gray-200 text-sm bg-white focus:border-gray-300 focus:ring-0 outline-none"
            >
              <option value="alle">Alle Zuständigen</option>
              @for (owner of ownerOptions; track owner.value) {
                <option [value]="owner.value">{{ owner.label }}</option>
              }
            </select>
            @if (filterSource !== 'alle' || filterOwner !== 'alle') {
              <button
                (click)="clearFilters()"
                class="text-xs text-gray-400 hover:text-gray-600"
              >
                Filter zurücksetzen
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="max-w-5xl mx-auto px-6 py-6">
        <!-- Task Groups -->
        @for (group of taskGroups(); track group.status) {
          <section class="mb-8">
            <!-- Group Header -->
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-2 h-2 rounded-full"
                [ngClass]="{
                  'bg-gray-300': group.status === 'offen',
                  'bg-blue-500': group.status === 'dran',
                  'bg-amber-500': group.status === 'bearbeitung',
                  'bg-purple-500': group.status === 'warten',
                  'bg-red-500': group.status === 'blockiert'
                }"
              ></div>
              <h2 class="text-sm font-semibold text-gray-700">
                {{ getStatusLabel(group.status) }}
              </h2>
              <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ group.tasks.length }}
              </span>
            </div>

            <!-- Tasks -->
            <div class="space-y-2">
              @for (task of group.tasks; track task.id) {
                <app-task-card
                  [task]="task"
                  (onStatusChange)="updateStatus(task.id, $event)"
                  (onNoteChange)="updateNote(task.id, $event)"
                  (onDelete)="deleteTask(task.id)"
                />
              }
            </div>
          </section>
        }

        <!-- Empty State -->
        @if (taskGroups().length === 0 && !loading()) {
          <div class="text-center py-20">
            <div class="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p class="text-gray-500 font-medium">Keine offenen Aufgaben</p>
            <p class="text-sm text-gray-400 mt-1">Erstelle eine neue Aufgabe um zu starten</p>
          </div>
        }

        <!-- Done Section -->
        @if (doneTasks().length > 0) {
          <section class="mt-10 pt-8 border-t border-gray-200">
            <button
              (click)="showDone.set(!showDone())"
              class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                class="w-4 h-4 transition-transform duration-200"
                [class.rotate-90]="showDone()"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              <span class="text-green-600">Erledigt</span>
              <span class="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ doneTasks().length }}
              </span>
            </button>

            @if (showDone()) {
              <div class="mt-4 space-y-2">
                @for (task of doneTasks(); track task.id) {
                  <div class="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div class="flex items-center gap-3">
                      <svg class="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                      </svg>
                      <span class="text-sm text-gray-500 line-through">{{ task.title }}</span>
                    </div>
                    <div class="flex items-center gap-3">
                      <button
                        (click)="restore(task.id)"
                        class="text-xs text-gray-400 hover:text-gray-600"
                      >
                        Wiederherstellen
                      </button>
                      <button
                        (click)="deleteTask(task.id)"
                        class="text-xs text-red-400 hover:text-red-600"
                      >
                        Löschen
                      </button>
                    </div>
                  </div>
                }
              </div>
            }
          </section>
        }
      </main>

      <!-- Export Toast -->
      @if (showExportToast()) {
        <div class="fixed bottom-6 right-6 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slide-up">
          <svg class="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <span class="text-sm font-medium">In Zwischenablage kopiert</span>
        </div>
      }

      <!-- Task Form Modal -->
      <app-task-form
        #taskForm
        (onSubmit)="addTask($event)"
      />

      <!-- Print View (hidden, used for printing) -->
      <div id="printArea" class="hidden print:block">
        <div class="p-8 max-w-3xl mx-auto">
          <!-- Print Header -->
          <div class="flex items-center justify-between border-b-2 border-gray-900 pb-4 mb-6">
            <div>
              <p class="text-xs font-bold text-amber-600 tracking-wider uppercase">Landerer Energie</p>
              <h1 class="text-xl font-bold text-gray-900 mt-1">Wochen-Board</h1>
              <p class="text-sm text-gray-500 mt-0.5">{{ weekLabel }}</p>
            </div>
            <div class="text-right text-xs text-gray-400">
              <p>Erstellt am {{ todayFormatted }}</p>
            </div>
          </div>

          <!-- Print Stats -->
          <div class="grid grid-cols-4 gap-4 mb-8">
            <div class="text-center p-3 bg-gray-50 rounded-lg">
              <p class="text-2xl font-bold text-gray-900">{{ stats().total }}</p>
              <p class="text-xs text-gray-500 mt-1">Aktiv</p>
            </div>
            <div class="text-center p-3 bg-amber-50 rounded-lg">
              <p class="text-2xl font-bold text-amber-600">{{ stats().inProgress }}</p>
              <p class="text-xs text-gray-500 mt-1">In Arbeit</p>
            </div>
            <div class="text-center p-3 bg-purple-50 rounded-lg">
              <p class="text-2xl font-bold text-purple-600">{{ stats().waiting }}</p>
              <p class="text-xs text-gray-500 mt-1">Wartend</p>
            </div>
            <div class="text-center p-3 bg-red-50 rounded-lg">
              <p class="text-2xl font-bold text-red-600">{{ stats().urgent }}</p>
              <p class="text-xs text-gray-500 mt-1">Dringend</p>
            </div>
          </div>

          <!-- Print Tasks by Status -->
          @for (group of taskGroups(); track group.status) {
            <div class="mb-6">
              <h2 class="text-sm font-bold text-gray-700 uppercase tracking-wide border-b border-gray-200 pb-2 mb-3">
                {{ getStatusLabel(group.status) }} ({{ group.tasks.length }})
              </h2>
              <table class="w-full text-sm">
                <thead>
                  <tr class="text-left text-xs text-gray-500 uppercase">
                    <th class="pb-2 font-medium">Aufgabe</th>
                    <th class="pb-2 font-medium w-24">Zuständig</th>
                    <th class="pb-2 font-medium w-20">Priorität</th>
                    <th class="pb-2 font-medium w-20">Fällig</th>
                  </tr>
                </thead>
                <tbody>
                  @for (task of group.tasks; track task.id) {
                    <tr class="border-b border-gray-100">
                      <td class="py-2">
                        <p class="font-medium text-gray-900">{{ task.title }}</p>
                        @if (task.note) {
                          <p class="text-xs text-gray-500 mt-0.5">{{ task.note }}</p>
                        }
                      </td>
                      <td class="py-2 text-gray-600">{{ getOwnerLabel(task.owner) }}</td>
                      <td class="py-2">
                        <span
                          class="text-xs font-medium"
                          [class.text-red-600]="task.priority === 'hoch'"
                          [class.text-amber-600]="task.priority === 'normal'"
                          [class.text-gray-500]="task.priority === 'niedrig'"
                        >
                          {{ getPriorityLabel(task.priority) }}
                        </span>
                      </td>
                      <td class="py-2 text-gray-600">
                        {{ task.dueDate ? formatDateShort(task.dueDate) : '-' }}
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          <!-- Print Footer -->
          <div class="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
            <span>Landerer Energie GmbH</span>
            <span>Seite 1</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes slide-up {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .animate-slide-up {
      animation: slide-up 0.2s ease-out;
    }
    @media print {
      .print\\:block { display: block !important; }
      body * { visibility: hidden; }
      #printArea, #printArea * { visibility: visible; }
      #printArea { position: absolute; left: 0; top: 0; width: 100%; }
    }
  `]
})
export class BoardComponent {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('taskForm') taskForm!: TaskFormComponent;

  filterSource = 'alle';
  filterOwner = 'alle';
  showDone = signal(false);
  showExportToast = signal(false);
  loading = signal(true);

  stats = this.taskService.stats;
  doneTasks = this.taskService.doneTasks;

  constructor() {
    // Set loading to false after initial load
    setTimeout(() => this.loading.set(false), 1000);
  }

  taskGroups = computed(() => {
    const groups = this.taskService.tasksByStatus();
    const filters = { source: this.filterSource, owner: this.filterOwner };

    if (filters.source === 'alle' && filters.owner === 'alle') {
      return groups;
    }

    return groups.map(group => ({
      ...group,
      tasks: group.tasks.filter(task => {
        if (filters.source !== 'alle' && task.source !== filters.source) return false;
        if (filters.owner !== 'alle' && task.owner !== filters.owner) return false;
        return true;
      })
    })).filter(group => group.tasks.length > 0);
  });

  sourceOptions = Object.entries(SOURCE_LABELS).map(([value, label]) => ({
    value: value as TaskSource,
    label
  }));

  ownerOptions = Object.entries(OWNER_LABELS).map(([value, label]) => ({
    value: value as TaskOwner,
    label
  }));

  get weekLabel(): string {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const days = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);

    const monday = new Date(now);
    monday.setDate(now.getDate() - now.getDay() + 1);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const format = (d: Date) => d.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
    return `KW ${weekNumber} · ${format(monday)} – ${format(sunday)}`;
  }

  get todayFormatted(): string {
    return new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  getStatusLabel(status: TaskStatus): string {
    return STATUS_CONFIG[status].label;
  }

  getOwnerLabel(owner: TaskOwner): string {
    return OWNER_LABELS[owner];
  }

  getPriorityLabel(priority: string): string {
    return PRIORITY_CONFIG[priority as keyof typeof PRIORITY_CONFIG]?.label || priority;
  }

  formatDateShort(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }

  applyFilters(): void {
    // Triggers reactivity via computed
  }

  clearFilters(): void {
    this.filterSource = 'alle';
    this.filterOwner = 'alle';
  }

  async addTask(data: TaskFormData): Promise<void> {
    await this.taskService.addTask(data);
  }

  async updateStatus(id: string, status: TaskStatus): Promise<void> {
    await this.taskService.updateTask(id, { status });
  }

  async updateNote(id: string, note: string): Promise<void> {
    await this.taskService.updateTask(id, { note: note || undefined });
  }

  async deleteTask(id: string): Promise<void> {
    if (confirm('Aufgabe wirklich löschen?')) {
      await this.taskService.deleteTask(id);
    }
  }

  async restore(id: string): Promise<void> {
    await this.taskService.restore(id);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  exportForManuel(): void {
    const groups = this.taskGroups();
    let text = `WOCHEN-BOARD EXPORT\n`;
    text += `${this.weekLabel}\n`;
    text += `Erstellt: ${this.todayFormatted}\n`;
    text += `${'='.repeat(50)}\n\n`;

    for (const group of groups) {
      text += `\n${this.getStatusLabel(group.status).toUpperCase()} (${group.tasks.length})\n`;
      text += `${'-'.repeat(40)}\n`;

      for (const task of group.tasks) {
        const priority = task.priority === 'hoch' ? '🔴' : task.priority === 'normal' ? '🟡' : '🟢';
        text += `${priority} ${task.title}\n`;
        text += `   Zuständig: ${this.getOwnerLabel(task.owner)}`;
        if (task.dueDate) {
          text += ` | Fällig: ${this.formatDateShort(task.dueDate)}`;
        }
        text += `\n`;
        if (task.note) {
          text += `   → ${task.note}\n`;
        }
        text += `\n`;
      }
    }

    // Stats
    const s = this.stats();
    text += `\n${'='.repeat(50)}\n`;
    text += `ZUSAMMENFASSUNG: ${s.total} Aktiv | ${s.inProgress} In Arbeit | ${s.waiting} Wartend | ${s.urgent} Dringend\n`;

    navigator.clipboard.writeText(text).then(() => {
      this.showExportToast.set(true);
      setTimeout(() => this.showExportToast.set(false), 2500);
    });
  }

  print(): void {
    window.print();
  }
}
