// src/app/models/denuncia.model.ts
import { Usuario } from "./user.model";

export interface Denuncia {
  id: number;
  ciudadano: Usuario | null;
  asunto: string;
  descripcion: string;
  anonima: boolean;
  estado: string;
  numeroSeguimiento: string;
  fechaCreacion: string; // ISO string
  atendidaPor: Usuario | null;
}

// Lo que la API espera al crear 
export interface DenunciaCreate {
  ciudadanoId: number | null;
  asunto: string;
  descripcion: string;
  anonima: boolean;
}


