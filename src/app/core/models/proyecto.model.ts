import { Usuario } from "./user.model";

export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  entidadResponsable: string;
  fechaInicio: string; // formato YYYY-MM-DD
  fechaFin: string;    // formato YYYY-MM-DD
  presupuesto: number;
  estado: 'Planeado' | 'En ejecución' | 'Finalizado';
  registradoPor: Usuario;
  fechaRegistro: string; // formato YYYY-MM-DD
}
