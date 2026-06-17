import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Task,
  TaskStatus,
  STATUS_CONFIG,
  PRIORITY_CONFIG,
  OWNER_LABELS,
  CATEGORY_LABELS
} from '../../../core/models/task.model';

@Component({
  selector: 'app-task-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div
      class="group relative bg-white rounded-xl border transition-all duration-200 hover:shadow-md"
      [class.border-gray-200]="!isOverdue"
      [class.border-red-300]="isOverdue"
      [class.bg-red-50]="isOverdue"
    >
      <div class="p-4">
        <div class="flex items-start gap-3">
          <div
            class="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
            [ngClass]="{
              'bg-gray-300': task.status === 'offen',
              'bg-blue-500': task.status === 'dran',
              'bg-amber-500': task.status === 'bearbeitung',
              'bg-purple-500': task.status === 'warten',
              'bg-red-500': task.status === 'blockiert',
              'bg-green-500': task.status === 'erledigt'
            }"
          ></div>

          <div class="flex-1 min-w-0">
            <h3 class="text-sm font-medium text-gray-900 leading-snug">
              {{ task.title }}
            </h3>

            <div class="flex flex-wrap items-center gap-1.5 mt-2">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold"
                [ngClass]="{
                  'bg-red-100 text-red-700': task.priority === 'hoch',
                  'bg-amber-100 text-amber-700': task.priority === 'normal',
                  'bg-gray-100 text-gray-600': task.priority === 'niedrig'
                }"
              >
                {{ priorityConfig.label }}
              </span>

              <span class="inline-flex items-center px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-xs font-medium">
                {{ ownerLabel }}
              </span>

              @if (task.dueDate) {
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                  [ngClass]="{
                    'bg-red-100 text-red-700': isOverdue,
                    'bg-gray-100 text-gray-600': !isOverdue
                  }"
                >
                  {{ formatDate(task.dueDate) }}
                </span>
              }

              <span class="text-xs text-gray-400">
                {{ categoryLabel }}
              </span>
            </div>

            @if (task.note && !editingNote) {
              <p class="mt-2.5 text-sm text-gray-500 leading-relaxed">
                {{ task.note }}
              </p>
            }

            @if (editingNote) {
              <div class="mt-2.5">
                <input
                  type="text"
                  [(ngModel)]="noteText"
                  (keydown.enter)="saveNote()"
                  (keydown.escape)="cancelNoteEdit()"
                  class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-0 outline-none"
                  placeholder="Notiz..."
                />
                <div class="flex gap-2 mt-2">
                  <button
                    (click)="saveNote()"
                    class="px-3 py-1 text-xs font-medium bg-gray-900 text-white rounded-md"
                  >
                    Speichern
                  </button>
                  <button
                    (click)="cancelNoteEdit()"
                    class="px-3 py-1 text-xs text-gray-500"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            }
          </div>

          <div class="flex items-center gap-1 shrink-0">
            <select
              [ngModel]="task.status"
              (ngModelChange)="onStatusChange.emit($event)"
              class="text-xs font-medium px-2 py-1 rounded-md border-0 cursor-pointer focus:ring-1 focus:ring-gray-300 outline-none"
              [ngClass]="statusConfig.bgColor + ' ' + statusConfig.color"
            >
              @for (status of statusOptions; track status.value) {
                <option [value]="status.value">{{ status.label }}</option>
              }
            </select>

            <div class="flex opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                (click)="startNoteEdit()"
                class="p-1.5 text-gray-400 hover:text-gray-600 rounded"
                title="Notiz"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </button>
              <button
                (click)="onDelete.emit()"
                class="p-1.5 text-gray-400 hover:text-red-500 rounded"
                title="Loeschen"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TaskCardComponent {
  @Input({ required: true }) task!: Task;
  @Output() onStatusChange = new EventEmitter<TaskStatus>();
  @Output() onNoteChange = new EventEmitter<string>();
  @Output() onDelete = new EventEmitter<void>();

  editingNote = false;
  noteText = '';

  statusOptions = Object.entries(STATUS_CONFIG).map(([value, config]) => ({
    value: value as TaskStatus,
    label: config.label
  }));

  get statusConfig() {
    return STATUS_CONFIG[this.task.status];
  }

  get priorityConfig() {
    return PRIORITY_CONFIG[this.task.priority];
  }

  get categoryLabel() {
    return CATEGORY_LABELS[this.task.category];
  }

  get ownerLabel() {
    return OWNER_LABELS[this.task.owner];
  }

  get isOverdue(): boolean {
    if (!this.task.dueDate || this.task.status === 'erledigt') return false;
    const due = new Date(this.task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' });
  }

  startNoteEdit(): void {
    this.noteText = this.task.note || '';
    this.editingNote = true;
  }

  saveNote(): void {
    this.onNoteChange.emit(this.noteText);
    this.editingNote = false;
  }

  cancelNoteEdit(): void {
    this.editingNote = false;
    this.noteText = '';
  }
}
