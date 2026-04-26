import { Proyecto } from "./proyecto.model";
import { Usuario } from "./user.model";

export interface Auditoria {
  id: number;
  descripcion: string;
  estado: string;
  entidad_control: string;
  proyecto: Proyecto;
  generadoPor: Usuario;
  aprobadoPor: Usuario;
}


// Lo que la API espera al crear
export interface AuditoriaCreate {
  descripcion: string;
  estado: string;
  entidad_control: string;
  proyectoId: number;
  generadoPorId: number;
  aprobadoPorId: number;
}
