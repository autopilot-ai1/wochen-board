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
import { Observable, map } from 'rxjs';
import { Task, TaskFormData, TaskStatus } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private firestore = inject(Firestore);
  private tasksCollection = collection(this.firestore, 'tasks');

  private _tasks = signal<Task[]>([]);
  tasks = this._tasks.asReadonly();

  // Computed signals for filtered/grouped views
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

  async addTask(data: TaskFormData): Promise<string> {
    const now = Timestamp.now();
    const docRef = await addDoc(this.tasksCollection, {
      ...data,
      createdAt: now,
      updatedAt: now
    });
    return docRef.id;
  }

  async updateTask(id: string, data: Partial<TaskFormData>): Promise<void> {
    const taskDoc = doc(this.firestore, 'tasks', id);
    await updateDoc(taskDoc, {
      ...data,
      updatedAt: Timestamp.now()
    });
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

  getFilteredTasks(filters: { source?: string; owner?: string }): Task[] {
    let tasks = this.activeTasks();

    if (filters.source && filters.source !== 'alle') {
      tasks = tasks.filter(t => t.source === filters.source);
    }

    if (filters.owner && filters.owner !== 'alle') {
      tasks = tasks.filter(t => t.owner === filters.owner);
    }

    return tasks;
  }
}
