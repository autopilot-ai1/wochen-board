import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Task,
  TaskStatus,
  TaskOwner,
  TaskPriority,
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
      class="bg-white rounded-card shadow-card hover:shadow-card-hover transition-card border border-gray-100 overflow-hidden group"
      [class.border-l-red-400]="isOverdue"
      [class.border-l-4]="isOverdue"
    >
      <div class="flex">
        <!-- Status Indicator -->
        <div
          class="w-1 shrink-0"
          [ngClass]="{
            'bg-gray-300': task.status === 'offen',
            'bg-blue-500': task.status === 'dran',
            'bg-amber-500': task.status === 'bearbeitung',
            'bg-purple-500': task.status === 'warten',
            'bg-red-500': task.status === 'blockiert',
            'bg-green-500': task.status === 'erledigt'
          }"
        ></div>

        <!-- Content -->
        <div class="flex-1 p-4">
          <div class="flex items-start justify-between gap-3">
            <div class="flex-1 min-w-0">
              <!-- Title -->
              <h3 class="font-medium text-gray-900 leading-snug">
                {{ task.title }}
              </h3>

              <!-- Meta Row -->
              <div class="flex flex-wrap items-center gap-2 mt-2">
                <span class="text-xs text-gray-500">{{ categoryLabel }}</span>
                <span class="text-gray-300">·</span>
                <span class="text-xs font-medium" [ngClass]="priorityConfig.color">
                  {{ priorityConfig.label }}
                </span>
                @if (task.dueDate) {
                  <span class="text-gray-300">·</span>
                  <span class="text-xs" [class.text-red-600]="isOverdue" [class.text-gray-500]="!isOverdue">
                    {{ formatDate(task.dueDate) }}
                  </span>
                }
              </div>

              <!-- Note -->
              @if (task.note && !editingNote) {
                <div class="mt-3 text-sm text-gray-600 border-l-2 border-landerer-300 pl-3 italic">
                  {{ task.note }}
                </div>
              }

              <!-- Note Editor -->
              @if (editingNote) {
                <div class="mt-3">
                  <input
                    type="text"
                    [(ngModel)]="noteText"
                    (keydown.enter)="saveNote()"
                    (keydown.escape)="cancelNoteEdit()"
                    class="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-landerer-500 focus:ring-1 focus:ring-landerer-200 outline-none"
                    placeholder="Notiz hinzufügen..."
                    #noteInput
                  />
                  <div class="flex gap-2 mt-2">
                    <button
                      (click)="saveNote()"
                      class="px-3 py-1.5 text-xs font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                    >
                      Speichern
                    </button>
                    <button
                      (click)="cancelNoteEdit()"
                      class="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              }
            </div>

            <!-- Actions -->
            <div class="flex flex-col items-end gap-2 shrink-0">
              <!-- Quick Actions (visible on hover) -->
              <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  (click)="startNoteEdit()"
                  class="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Notiz bearbeiten"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                  </svg>
                </button>
                <button
                  (click)="onDelete.emit()"
                  class="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Löschen"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>

              <!-- Status Dropdown -->
              <select
                [ngModel]="task.status"
                (ngModelChange)="onStatusChange.emit($event)"
                class="text-xs font-medium px-2 py-1 rounded-lg border-0 cursor-pointer focus:ring-2 focus:ring-landerer-200 outline-none"
                [ngClass]="statusConfig.bgColor + ' ' + statusConfig.color"
              >
                @for (status of statusOptions; track status.value) {
                  <option [value]="status.value">{{ status.label }}</option>
                }
              </select>

              <!-- Owner Badge -->
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {{ ownerLabel }}
              </span>
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
