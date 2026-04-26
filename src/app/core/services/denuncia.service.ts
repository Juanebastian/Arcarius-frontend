// src/app/services/denuncia.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { Denuncia, DenunciaCreate } from '../models/denuncia.model';
import { environment } from '../../../environments/environment.component';


@Injectable({
  providedIn: 'root',
})
export class DenunciaService {
  private apiUrl = environment.apiUrl;
  private denunciaUrl = `${this.apiUrl}/denuncias`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /** Crea una nueva denuncia */
createDenuncia(data: DenunciaCreate): Observable<Denuncia> {
  const headers = this.getAuthHeaders();
  return this.http.post<Denuncia>(this.denunciaUrl, data, { headers }).pipe(
    catchError((err) => {
      console.error('❌ Error al crear denuncia:', err);
      return throwError(() => err);
    })
  );
}

  /** Obtiene todas las denuncias */
  getAllDenuncias(): Observable<Denuncia[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Denuncia[]>(this.denunciaUrl, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener denuncias:', err);
        return throwError(() => err);
      })
    );
  }

  /** Actualiza una denuncia */
  updateDenuncia(denunciaId: number, data: Partial<Denuncia>): Observable<Denuncia> {
    const headers = this.getAuthHeaders();
    return this.http.put<Denuncia>(`${this.denunciaUrl}/${denunciaId}`, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al actualizar denuncia:', err);
        return throwError(() => err);
      })
    );
  }

  /** Elimina una denuncia */
  deleteDenuncia(denunciaId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.denunciaUrl}/${denunciaId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al eliminar denuncia:', err);
        return throwError(() => err);
      })
    );
  }
}
