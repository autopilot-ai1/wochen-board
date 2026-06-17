import { Timestamp } from '@angular/fire/firestore';

export type TaskCategory = 'kundentermine' | 'angebote' | 'recruiting' | 'intern' | 'sonstiges';
export type TaskStatus = 'offen' | 'dran' | 'bearbeitung' | 'warten' | 'blockiert' | 'erledigt';
export type TaskPriority = 'hoch' | 'normal' | 'niedrig';
export type TaskOwner = 'zoran' | 'zoran_manuel' | 'zoran_alana' | 'kerem' | 'alana' | 'techniker' | 'manuel' | 'offen';
export type TaskSource = 'eigen' | 'manuel' | 'alana' | 'kerem' | 'extern';

export interface Task {
  id: string;
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  owner: TaskOwner;
  source: TaskSource;
  dueDate?: string;
  note?: string;
  createdAt: Timestamp | Date;
  updatedAt: Timestamp | Date;
}

export interface TaskFormData {
  title: string;
  category: TaskCategory;
  status: TaskStatus;
  priority: TaskPriority;
  owner: TaskOwner;
  source: TaskSource;
  dueDate?: string;
  note?: string;
}

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  kundentermine: 'Kundentermine',
  angebote: 'Angebote / Projekte',
  recruiting: 'Recruiting',
  intern: 'Interne Aufgaben',
  sonstiges: 'Sonstiges'
};

export const STATUS_CONFIG: Record<TaskStatus, { label: string; icon: string; color: string; bgColor: string }> = {
  offen: { label: 'Offen', icon: '○', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  dran: { label: 'Ich bin dran', icon: '●', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  bearbeitung: { label: 'In Bearbeitung', icon: '◐', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  warten: { label: 'Warte auf...', icon: '◷', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  blockiert: { label: 'Blockiert', icon: '!', color: 'text-red-600', bgColor: 'bg-red-50' },
  erledigt: { label: 'Erledigt', icon: '✓', color: 'text-green-600', bgColor: 'bg-green-50' }
};

export const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bgColor: string }> = {
  hoch: { label: 'Dringend', color: 'text-red-700', bgColor: 'bg-red-50' },
  normal: { label: 'Normal', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  niedrig: { label: 'Kann warten', color: 'text-green-700', bgColor: 'bg-green-50' }
};

export const OWNER_LABELS: Record<TaskOwner, string> = {
  zoran: 'Zoran',
  zoran_manuel: 'Zoran + Manuel',
  zoran_alana: 'Zoran + Alana',
  kerem: 'Kerem',
  alana: 'Alana',
  techniker: 'Techniker',
  manuel: 'Manuel',
  offen: 'Nicht zugewiesen'
};

export const SOURCE_LABELS: Record<TaskSource, string> = {
  eigen: 'Eigene Aufgabe',
  manuel: 'Von Manuel',
  alana: 'Von Alana',
  kerem: 'Von Kerem',
  extern: 'Extern / Kunde'
};
