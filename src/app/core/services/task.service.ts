import { Injectable, inject, signal, computed } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  query,
  orderBy
} from '@angular/fire/firestore';
import { map } from 'rxjs';
import { Task, TaskFormData, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');

  private _tasks = signal<Task[]>([]);
  tasks = this._tasks.asReadonly();

  activeTasks = computed(() => this._tasks().filter(t => t.status !== 'erledigt'));
  doneTasks = computed(() => this._tasks().filter(t => t.status === 'erledigt'));

  tasksByStatus = computed(() => {
    const tasks = this._tasks();
    const statusOrder: TaskStatus[] = ['bearbeitung', 'dran', 'warten', 'blockiert', 'offen'];
    return statusOrder.map(status => ({
      status,
      tasks: tasks.filter(t => t.status === status)
    })).filter(group => group.tasks.length > 0);
  });

  stats = computed(() => {
    const tasks = this._tasks();
    const active = tasks.filter(t => t.status !== 'erledigt');
    return {
      total: active.length,
      waiting: tasks.filter(t => t.status === 'warten').length,
      urgent: tasks.filter(t => t.priority === 'hoch' && t.status !== 'erledigt').length,
      inProgress: tasks.filter(t => t.status === 'bearbeitung' || t.status === 'dran').length,
      done: tasks.filter(t => t.status === 'erledigt').length
    };
  });

  constructor() {
    this.loadTasks();
  }

  private loadTasks(): void {
    const q = query(this.tasksCollection, orderBy('createdAt', 'desc'));
    collectionData(q, { idField: 'id' }).pipe(
      map(docs => docs as Task[])
    ).subscribe(tasks => {
      this._tasks.set(tasks);
    });
  }

  // Remove undefined values - Firestore doesn't accept them
  private cleanData(data: Record<string, any>): Record<string, any> {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = value;
      }
    }
    return cleaned;
  }

  async addTask(data: TaskFormData): Promise<string> {
    const now = Timestamp.now();
    const taskData = this.cleanData({
      title: data.title,
      category: data.category,
      status: data.status,
      priority: data.priority,
      owner: data.owner,
      source: data.source,
      dueDate: data.dueDate || null,
      note: data.note || null,
      createdAt: now,
      updatedAt: now
    });

    const docRef = await addDoc(this.tasksCollection, taskData);
    return docRef.id;
  }

  async updateTask(id: string, data: Partial<TaskFormData>): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', id);

    // Convert undefined to null for optional fields
    const updateData: Record<string, any> = {
      updatedAt: Timestamp.now()
    };

    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        updateData[key] = value;
      } else if (key === 'note' || key === 'dueDate') {
        // Allow clearing optional fields by setting to null
        updateData[key] = null;
      }
    }

    await updateDoc(taskDoc, updateData);
  }

  async deleteTask(id: string): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', id);
    await deleteDoc(taskDoc);
  }

  async markDone(id: string): Promise<void> {
    await this.updateTask(id, { status: 'erledigt' });
  }

  async restore(id: string): Promise<void> {
    await this.updateTask(id, { status: 'offen' });
  }
}
