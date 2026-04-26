// src/app/services/gasto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Gasto } from '../models/gasto.model';
import { environment } from '../../../environments/environment.component';

@Injectable({
  providedIn: 'root',
})
export class GastoService {
  private apiUrl = environment.apiUrl;
  private gastosUrl = `${this.apiUrl}/gastos`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /** Obtiene todos los gastos */
  getAllGastos(): Observable<Gasto[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Gasto[]>(this.gastosUrl, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener gastos:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene un gasto por ID */
  getGastoById(gastoId: number): Observable<Gasto> {
    const headers = this.getAuthHeaders();
    return this.http.get<Gasto>(`${this.gastosUrl}/${gastoId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener gasto por ID:', err);
        return throwError(() => err);
      })
    );
  }

  /** Crea un nuevo gasto */
  createGasto(data: Partial<Gasto>): Observable<Gasto> {
    const headers = this.getAuthHeaders();
    return this.http.post<Gasto>(this.gastosUrl, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al crear gasto:', err);
        return throwError(() => err);
      })
    );
  }

  /** Actualiza un gasto */
  updateGasto(gastoId: number, data: Partial<Gasto>): Observable<Gasto> {
    const headers = this.getAuthHeaders();
    return this.http.put<Gasto>(`${this.gastosUrl}/${gastoId}`, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al actualizar gasto:', err);
        return throwError(() => err);
      })
    );
  }

  /** Elimina un gasto */
  deleteGasto(gastoId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.gastosUrl}/${gastoId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al eliminar gasto:', err);
        return throwError(() => err);
      })
    );
  }

/** Obtiene todos los gastos de un proyecto por su ID de proyecto*/
getGastosPorProyecto(proyectoId: number): Observable<Gasto[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<Gasto[]>(`${this.gastosUrl}/proyecto/${proyectoId}`, { headers }).pipe(
    catchError((err) => {
      console.error(`❌ Error al obtener gastos del proyecto ${proyectoId}:`, err);
      return throwError(() => err);
    })
  );
}

/** Obtiene todos los gastos registrados por un usuario */
getGastosPorUsuario(usuarioId: number): Observable<Gasto[]> {
  const headers = this.getAuthHeaders();
  return this.http.get<Gasto[]>(`${this.gastosUrl}/usuario/${usuarioId}`, { headers }).pipe(
    catchError((err) => {
      console.error(`❌ Error al obtener gastos del usuario ${usuarioId}:`, err);
      return throwError(() => err);
    })
  );
}


}
