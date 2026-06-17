import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  TaskFormData,
  TaskCategory,
  TaskStatus,
  TaskPriority,
  TaskOwner,
  TaskSource,
  CATEGORY_LABELS,
  PRIORITY_CONFIG,
  OWNER_LABELS,
  SOURCE_LABELS
} from '../../../core/models/task.model';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div
        class="fixed inset-0 bg-black/30 z-40 transition-opacity"
        (click)="close()"
      ></div>

      <!-- Modal -->
      <div class="fixed inset-x-4 top-[5%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-xl shadow-2xl z-50 overflow-hidden max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
          <h2 class="text-base font-semibold text-gray-900">Neue Aufgabe</h2>
          <button
            (click)="close()"
            class="p-1 text-gray-400 hover:text-gray-600 rounded"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" class="p-5">
          <!-- Title -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 mb-1">Aufgabe *</label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              class="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none placeholder-gray-400"
              [class.border-red-300]="showError && !formData.title.trim()"
              placeholder="Was muss erledigt werden?"
            />
            @if (showError && !formData.title.trim()) {
              <p class="text-xs text-red-500 mt-1">Bitte Aufgabe eingeben</p>
            }
          </div>

          <!-- Grid: Category, Priority, Owner, Source -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Kategorie</label>
              <select
                [(ngModel)]="formData.category"
                name="category"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none bg-white"
              >
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Prioritaet</label>
              <select
                [(ngModel)]="formData.priority"
                name="priority"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none bg-white"
              >
                @for (prio of priorities; track prio.value) {
                  <option [value]="prio.value">{{ prio.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Zustaendig</label>
              <select
                [(ngModel)]="formData.owner"
                name="owner"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none bg-white"
              >
                @for (owner of owners; track owner.value) {
                  <option [value]="owner.value">{{ owner.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-500 mb-1">Quelle</label>
              <select
                [(ngModel)]="formData.source"
                name="source"
                class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none bg-white"
              >
                @for (src of sources; track src.value) {
                  <option [value]="src.value">{{ src.label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Due Date -->
          <div class="mb-4">
            <label class="block text-xs font-medium text-gray-500 mb-1">Faellig bis (optional)</label>
            <input
              type="date"
              [(ngModel)]="formData.dueDate"
              name="dueDate"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none"
            />
          </div>

          <!-- Note - full width textarea -->
          <div class="mb-5">
            <label class="block text-xs font-medium text-gray-500 mb-1">Notiz (optional)</label>
            <textarea
              [(ngModel)]="formData.note"
              name="note"
              rows="3"
              class="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-gray-400 focus:ring-0 outline-none placeholder-gray-400 resize-none"
              placeholder="Zusaetzliche Infos, Kontext, Details..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex gap-2">
            <button
              type="submit"
              class="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Erstellen
            </button>
            <button
              type="button"
              (click)="close()"
              class="py-2.5 px-4 text-sm text-gray-500 hover:text-gray-700 font-medium transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </form>
      </div>
    }
  `
})
export class TaskFormComponent {
  @Output() onSubmit = new EventEmitter<TaskFormData>();
  @Output() onClose = new EventEmitter<void>();

  isOpen = signal(false);
  showError = false;

  formData: TaskFormData = this.getDefaultFormData();

  categories = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({
    value: value as TaskCategory,
    label
  }));

  priorities = Object.entries(PRIORITY_CONFIG).map(([value, config]) => ({
    value: value as TaskPriority,
    label: config.label
  }));

  owners = Object.entries(OWNER_LABELS).map(([value, label]) => ({
    value: value as TaskOwner,
    label
  }));

  sources = Object.entries(SOURCE_LABELS).map(([value, label]) => ({
    value: value as TaskSource,
    label
  }));

  private getDefaultFormData(): TaskFormData {
    return {
      title: '',
      category: 'intern',
      status: 'offen',
      priority: 'normal',
      owner: 'zoran',
      source: 'eigen',
      dueDate: '',
      note: ''
    };
  }

  open(): void {
    this.formData = this.getDefaultFormData();
    this.showError = false;
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.showError = false;
    this.onClose.emit();
  }

  submit(): void {
    // Validate
    if (!this.formData.title.trim()) {
      this.showError = true;
      return;
    }

    this.onSubmit.emit({
      ...this.formData,
      title: this.formData.title.trim(),
      note: this.formData.note?.trim() || '',
      dueDate: this.formData.dueDate || ''
    });

    this.close();
  }
}
