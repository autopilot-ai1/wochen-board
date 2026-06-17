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
        class="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
        (click)="close()"
      ></div>

      <!-- Modal -->
      <div class="fixed inset-x-4 top-[10%] md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-lg bg-white rounded-2xl shadow-modal z-50 overflow-hidden">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-100">
          <h2 class="text-lg font-semibold text-gray-900">Neue Aufgabe</h2>
        </div>

        <!-- Form -->
        <form (ngSubmit)="submit()" class="p-6 space-y-5">
          <!-- Title -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Aufgabe
            </label>
            <input
              type="text"
              [(ngModel)]="formData.title"
              name="title"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all"
              placeholder="Was muss erledigt werden?"
              required
            />
          </div>

          <!-- Category & Priority -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Kategorie
              </label>
              <select
                [(ngModel)]="formData.category"
                name="category"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all bg-white"
              >
                @for (cat of categories; track cat.value) {
                  <option [value]="cat.value">{{ cat.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Priorität
              </label>
              <select
                [(ngModel)]="formData.priority"
                name="priority"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all bg-white"
              >
                @for (prio of priorities; track prio.value) {
                  <option [value]="prio.value">{{ prio.label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Owner & Source -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Zuständig
              </label>
              <select
                [(ngModel)]="formData.owner"
                name="owner"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all bg-white"
              >
                @for (owner of owners; track owner.value) {
                  <option [value]="owner.value">{{ owner.label }}</option>
                }
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1.5">
                Quelle
              </label>
              <select
                [(ngModel)]="formData.source"
                name="source"
                class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all bg-white"
              >
                @for (src of sources; track src.value) {
                  <option [value]="src.value">{{ src.label }}</option>
                }
              </select>
            </div>
          </div>

          <!-- Due Date -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Fällig bis (optional)
            </label>
            <input
              type="date"
              [(ngModel)]="formData.dueDate"
              name="dueDate"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all"
            />
          </div>

          <!-- Note -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
              Notiz (optional)
            </label>
            <textarea
              [(ngModel)]="formData.note"
              name="note"
              rows="2"
              class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-landerer-500 focus:ring-2 focus:ring-landerer-100 outline-none transition-all resize-none"
              placeholder="Zusätzliche Infos..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="flex gap-3 pt-2">
            <button
              type="submit"
              class="flex-1 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white font-medium rounded-xl transition-colors"
            >
              Hinzufügen
            </button>
            <button
              type="button"
              (click)="close()"
              class="py-2.5 px-6 text-gray-600 hover:text-gray-900 font-medium transition-colors"
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
    this.isOpen.set(true);
  }

  close(): void {
    this.isOpen.set(false);
    this.onClose.emit();
  }

  submit(): void {
    if (!this.formData.title.trim()) return;

    this.onSubmit.emit({
      ...this.formData,
      title: this.formData.title.trim(),
      note: this.formData.note?.trim() || undefined,
      dueDate: this.formData.dueDate || undefined
    });

    this.close();
  }
}
