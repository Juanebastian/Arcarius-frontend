export interface ProyectoDocumentoDTO {
  proyecto_id: number;        // ID del proyecto
  tipo: string;               // Tipo de documento (PDF, Word, etc.)
  file: string;               // Archivo a subir en formato binario
  subido_por: number;         // ID del usuario que sube el archivo
}

export interface ProyectoDocumento {
  id: number;
  proyecto_id: number;
  tipo: string;
  ruta_archivo: string;
  hash_archivo: string;
  subido_por: number;
  fecha_subida: string;       // formato ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ
}
