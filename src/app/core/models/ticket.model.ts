import { Usuario } from "./user.model";


// estado.model.ts
export interface Estado {
  id: number;
  nombre: string;
  descripcion: string;
}

// prioridad.model.ts
export interface Prioridad {
  id: number;
  nombre: string;
  descripcion: string;
}

// ticket.model.ts

// Lo que la API devuelve
export interface Ticket {
  id: number;
  asunto: string;
  descripcion: string;
  estado: Estado;         //devuelve id
  prioridad: Prioridad;   //devuelve id
  creadoPor: Usuario;     //devuelve id
  asignadoA: Usuario;     //devuelve id
  fecha_creacion: string;
  fecha_actualizacion: string;
  observaciones?: string | null;
}

// Lo que la API espera al crear
export interface TicketCreate {
  asunto: string;
  descripcion: string;
  asignadoAId: Usuario;       //espera un id
  estadoId: Estado;           //espera un id
  prioridadId: Prioridad;     //espera un id
  observaciones?: string | null;
}


// Lo que la API espera al Asignar
export interface TicketUpdate {
  estadoId: Estado;
  asignadoAId: Usuario;       //espera un id  
  observaciones?: string | null;
}