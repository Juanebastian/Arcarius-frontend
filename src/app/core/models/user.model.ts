// Lo que la API devuelve

export interface Usuario {
  id: number;
  documento: string;
  nombre_completo: string;
  email: string;
  rol_id: number;
  telefono?: number;
  activo: boolean;
  fecha_registro: string;
}

// Lo que la API espera al crear
export interface UsuarioCreate {
  documento: string;
  nombre_completo: string;
  email: string;
  password_hash: string;
  rol_id: number;
  telefono?: number;
  activo: boolean;
}

// Lo que la API espera al actualizar
export interface UsuarioUpdate {
  documento?: string;
  nombre_completo?: string;
  email?: string;
  password_hash?: string;
  rol_id?: number;
  telefono?: number;
  activo?: boolean;
}
