import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

import { Proyecto } from '../models/proyecto.model';
import { environment } from '../../../environments/environment.component';

@Injectable({
  providedIn: 'root',
})
export class ProyectoService {
  private apiUrl = environment.apiUrl;
  private proyectosUrl = `${this.apiUrl}/proyectos`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  /** Genera headers con token de autorización */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /** Registra un nuevo proyecto */
  createProyecto(data: Partial<Proyecto>): Observable<Proyecto> {
    const headers = this.getAuthHeaders();
    return this.http.post<Proyecto>(this.proyectosUrl, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al registrar proyecto:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene todos los proyectos */
  getAllProyectos(): Observable<Proyecto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Proyecto[]>(this.proyectosUrl, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener proyectos:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene un proyecto por ID */
  getProyectoById(proyectoId: number): Observable<Proyecto> {
    const headers = this.getAuthHeaders();
    return this.http.get<Proyecto>(`${this.proyectosUrl}/${proyectoId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener proyecto por ID:', err);
        return throwError(() => err);
      })
    );
  }

  /** Actualiza un proyecto */
  updateProyecto(proyectoId: number, data: Partial<Proyecto>): Observable<Proyecto> {
    const headers = this.getAuthHeaders();
    return this.http.put<Proyecto>(`${this.proyectosUrl}/${proyectoId}`, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al actualizar proyecto:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene todos los proyectos registrados por un usuario */
getProyectosPorUsuario(usuarioId: number): Observable<Proyecto[]> {
  const headers = this.getAuthHeaders();
  return this.http
    .get<Proyecto[]>(`${this.proyectosUrl}/usuario/${usuarioId}`, { headers })
    .pipe(
      catchError((err) => {
        console.error(`❌ Error al obtener proyectos del usuario ${usuarioId}:`, err);
        return throwError(() => err);
      })
    );
}
}
