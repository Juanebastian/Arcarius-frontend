// src/app/services/auditoria.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Auditoria, AuditoriaCreate } from '../models/auditoria.model';
import { environment } from '../../../environments/environment.component';


@Injectable({
  providedIn: 'root',
})
export class AuditoriaService {
  private apiUrl = environment.apiUrl;
  private auditoriaUrl = `${this.apiUrl}/auditorias`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }


  /** Crea una nueva auditoría */
createAuditoria(data: AuditoriaCreate): Observable<Auditoria> {
  const headers = this.getAuthHeaders();
  return this.http.post<Auditoria>(this.auditoriaUrl, data, { headers }).pipe(
    catchError((err) => {
      console.error('❌ Error al crear auditoría:', err);
      return throwError(() => err);
    })
  );
}

  /** Obtiene todas las auditorías */
  getAllAuditorias(): Observable<Auditoria[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Auditoria[]>(this.auditoriaUrl, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener auditorías:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene una auditoría por ID */
  getAuditoriaById(auditoriaId: number): Observable<Auditoria> {
    const headers = this.getAuthHeaders();
    return this.http.get<Auditoria>(`${this.auditoriaUrl}/${auditoriaId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener auditoría por ID:', err);
        return throwError(() => err);
      })
    );
  }



  /** Actualiza una auditoría */
  updateAuditoria(auditoriaId: number, data: Partial<Auditoria>): Observable<Auditoria> {
    const headers = this.getAuthHeaders();
    return this.http.put<Auditoria>(`${this.auditoriaUrl}/${auditoriaId}`, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al actualizar auditoría:', err);
        return throwError(() => err);
      })
    );
  }

  /** Elimina una auditoría */
  deleteAuditoria(auditoriaId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.auditoriaUrl}/${auditoriaId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al eliminar auditoría:', err);
        return throwError(() => err);
      })
    );
  }


  /** Obtiene todas las auditorías registradas por un usuario */
  getAuditoriasPorUsuario(usuarioId: number): Observable<Auditoria[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Auditoria[]>(`${this.auditoriaUrl}/usuario/${usuarioId}`, { headers }).pipe(
      catchError((err) => {
        console.error(`❌ Error al obtener auditorías del usuario ${usuarioId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene todas las auditorías de un proyecto */
getAuditoriasPorProyecto(proyectoId: number): Observable<Auditoria[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<Auditoria[]>(`${this.auditoriaUrl}/proyecto/${proyectoId}`, { headers }).pipe(
    catchError((err) => {
      console.error(`❌ Error al obtener auditorías del proyecto ${proyectoId}:`, err);
      return throwError(() => err);
    })
  );
}

}
