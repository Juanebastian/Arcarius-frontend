// src/app/models/gasto.model.ts
import { Proyecto } from './proyecto.model';
import { Usuario } from './user.model';

export interface Gasto {
  id: number;
  proyecto: Proyecto;
  fecha: string; // fecha del gasto
  monto: number; // monto del gasto
  descripcion: string;
  registradoPor: Usuario;
  fechaRegistro: string; // fecha de registro del gasto
}
