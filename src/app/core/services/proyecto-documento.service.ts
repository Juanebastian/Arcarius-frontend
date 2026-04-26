import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.component';
import { ProyectoDocumento } from '../models/proyecto-documento.model';
import { ProyectoDocumentoDTO } from '../models/proyecto-documento.model';

@Injectable({
  providedIn: 'root',
})
export class ProyectoDocumentoService {
  private apiUrl = environment.apiUrl;
  private documentosUrl = `${this.apiUrl}/proyecto-documentos`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /** Genera headers con token */
  private getAuthHeaders(contentType: string = 'application/json'): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': contentType,
    });
  }

  /** Subir archivo a IPFS y registrar en la base de datos */
/** Subir archivo a IPFS y registrar en la base de datos */
uploadDocumento(
  proyectoId: number,
  file: File,
  tipo: string,
  subidoPor: number
): Observable<ProyectoDocumento> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('proyecto_id', proyectoId.toString()); // 👈 usa snake_case
  formData.append('tipo', tipo);
  formData.append('subido_por', subidoPor.toString());

  const url = `${this.documentosUrl}/upload`; // 👈 agrega /upload

  return this.http.post<ProyectoDocumento>(url, formData, {
    headers: new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`
      // No pongas Content-Type, Angular lo maneja solo
    }),
    withCredentials: true
  }).pipe(
    catchError((err) => {
      console.error('❌ Error al subir documento:', err);
      return throwError(() => err);
    })
  );
}




  /** Obtener documentos de un proyecto */
  getDocumentosByProyecto(proyectoId: number): Observable<ProyectoDocumento[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<ProyectoDocumento[]>(`${this.documentosUrl}/proyecto/${proyectoId}`, { headers }).pipe(
      catchError((err) => {
        console.error(`❌ Error al obtener documentos del proyecto ${proyectoId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** Descargar archivo por hash o CID */
  downloadDocumento(hashArchivo: string): Observable<Blob> {
    const url = `${this.apiUrl}/ipfs/${hashArchivo}`;
    return this.http.get(url, { responseType: 'blob' }).pipe(
      catchError((err) => {
        console.error(`❌ Error al descargar documento ${hashArchivo}:`, err);
        return throwError(() => err);
      })
    );
  }
}
