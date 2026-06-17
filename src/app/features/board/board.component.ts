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
  SOURCE_LABELS
} from '../../core/models/task.model';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, FormsModule, TaskCardComponent, TaskFormComponent],
  template: `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div class="max-w-4xl mx-auto px-4 py-4">
          <div class="flex items-center justify-between">
            <!-- Brand -->
            <div>
              <div class="flex items-center gap-2">
                <div class="w-8 h-8 rounded-lg bg-landerer-500 flex items-center justify-center">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div>
                  <h1 class="text-lg font-semibold text-gray-900">Wochen-Board</h1>
                </div>
              </div>
              <p class="text-xs text-gray-500 mt-0.5 ml-10">{{ weekLabel }}</p>
            </div>

            <!-- Actions -->
            <div class="flex items-center gap-3">
              <button
                (click)="logout()"
                class="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Abmelden
              </button>
            </div>
          </div>

          <!-- Stats -->
          <div class="flex gap-6 mt-4 text-sm">
            <div class="flex items-center gap-1.5">
              <span class="text-2xl font-semibold text-gray-900">{{ stats().total }}</span>
              <span class="text-gray-500">Aktiv</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-2xl font-semibold text-purple-600">{{ stats().waiting }}</span>
              <span class="text-gray-500">Wartend</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-2xl font-semibold text-red-600">{{ stats().urgent }}</span>
              <span class="text-gray-500">Dringend</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-2xl font-semibold text-green-600">{{ stats().done }}</span>
              <span class="text-gray-500">Erledigt</span>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <main class="max-w-4xl mx-auto px-4 py-6">
        <!-- Filter Bar -->
        <div class="flex flex-wrap items-center gap-3 mb-6">
          <select
            [(ngModel)]="filterSource"
            (ngModelChange)="applyFilters()"
            class="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium bg-white focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all"
          >
            <option value="alle">Alle Quellen</option>
            @for (src of sourceOptions; track src.value) {
              <option [value]="src.value">{{ src.label }}</option>
            }
          </select>

          <select
            [(ngModel)]="filterOwner"
            (ngModelChange)="applyFilters()"
            class="px-4 py-2 rounded-full border border-gray-200 text-sm font-medium bg-white focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all"
          >
            <option value="alle">Alle Zuständigen</option>
            @for (owner of ownerOptions; track owner.value) {
              <option [value]="owner.value">{{ owner.label }}</option>
            }
          </select>

          <button
            (click)="taskForm.open()"
            class="ml-auto px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-full transition-colors flex items-center gap-2"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
            Neue Aufgabe
          </button>
        </div>

        <!-- Task Groups -->
        @for (group of taskGroups(); track group.status) {
          <section class="mb-8">
            <div class="flex items-center gap-2 mb-3">
              <span
                class="px-3 py-1 rounded-full text-xs font-semibold"
                [ngClass]="getStatusStyle(group.status)"
              >
                {{ getStatusLabel(group.status) }}
              </span>
              <span class="text-sm text-gray-400">{{ group.tasks.length }}</span>
            </div>

            <div class="space-y-3">
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
        @if (taskGroups().length === 0) {
          <div class="text-center py-16">
            <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
              </svg>
            </div>
            <p class="text-gray-500">Keine Aufgaben gefunden</p>
          </div>
        }

        <!-- Done Section -->
        @if (doneTasks().length > 0) {
          <section class="mt-12 pt-6 border-t border-gray-200">
            <button
              (click)="showDone.set(!showDone())"
              class="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg
                class="w-4 h-4 transition-transform"
                [class.rotate-90]="showDone()"
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
              </svg>
              Erledigt ({{ doneTasks().length }})
            </button>

            @if (showDone()) {
              <div class="mt-4 space-y-2">
                @for (task of doneTasks(); track task.id) {
                  <div class="flex items-center justify-between py-2 px-4 bg-green-50 rounded-xl">
                    <span class="text-sm text-gray-600 line-through">{{ task.title }}</span>
                    <div class="flex gap-2">
                      <button
                        (click)="restore(task.id)"
                        class="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        Wiederherstellen
                      </button>
                      <button
                        (click)="deleteTask(task.id)"
                        class="text-xs text-red-500 hover:text-red-700 transition-colors"
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

      <!-- Task Form Modal -->
      <app-task-form
        #taskForm
        (onSubmit)="addTask($event)"
      />
    </div>
  `
})
export class BoardComponent {
  private taskService = inject(TaskService);
  private authService = inject(AuthService);
  private router = inject(Router);

  @ViewChild('taskForm') taskForm!: TaskFormComponent;

  filterSource = 'alle';
  filterOwner = 'alle';
  showDone = signal(false);

  stats = this.taskService.stats;
  doneTasks = this.taskService.doneTasks;

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

  getStatusLabel(status: TaskStatus): string {
    return STATUS_CONFIG[status].label;
  }

  getStatusStyle(status: TaskStatus): string {
    return STATUS_CONFIG[status].bgColor + ' ' + STATUS_CONFIG[status].color;
  }

  applyFilters(): void {
    // Triggers reactivity via computed
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
}
