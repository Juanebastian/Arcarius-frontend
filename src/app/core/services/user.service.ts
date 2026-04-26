import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, of, tap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.component';
import { Usuario } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;
  private usuariosUrl = `${this.apiUrl}/usuarios`;

  /** Genera headers con token de autorización */
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /** Registra un nuevo usuario */
  createUser(data: Partial<Usuario>): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http.post<Usuario>(this.usuariosUrl, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al registrar usuario:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene todos los usuarios */
  getAllUsers(): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Usuario[]>(this.usuariosUrl, { headers }).pipe(
      catchError((err) => {
        console.error(' Error al obtener usuarios:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene un usuario por ID */
  getUserById(userId: number): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<Usuario>(`${this.usuariosUrl}/${userId}`, { headers })
      .pipe(
        catchError((err) => {
          console.error('❌ Error al obtener usuario por ID:', err);
          return throwError(() => err);
        })
      );
  }

  /** Actualiza un usuario */
  updateUser(userId: number, data: Partial<Usuario>): Observable<Usuario> {
    const headers = this.getAuthHeaders();
    return this.http
      .patch<Usuario>(`${this.usuariosUrl}/${userId}`, data, { headers })
      .pipe(
        catchError((err) => {
          console.error('❌ Error al actualizar usuario:', err);
          return throwError(() => err);
        })
      );
  }

  /** Obtiene todos los usuarios filtrados por rol */
  getUsersByRol(rolId: number): Observable<Usuario[]> {
    const headers = this.getAuthHeaders();
    return this.http
      .get<Usuario[]>(`${this.usuariosUrl}/rol/${rolId}`, { headers })
      .pipe(
        catchError((err) => {
          console.error(`❌ Error al obtener usuarios con rol ${rolId}:`, err);
          return throwError(() => err);
        })
      );
  }

// dentro de la clase UserService añade:
private usersCache$ = new BehaviorSubject<Usuario[] | null>(null);

getCachedUsers(): Observable<Usuario[]> {
  const cached = this.usersCache$.value;
  if (cached) return of(cached);

  // Si no hay cache, hacemos la petición y la guardamos
  return this.getAllUsers().pipe(
    tap(users => this.usersCache$.next(users))
  );
}

// (Opcional) para forzar refrescar el cache:
refreshUsersCache(): Observable<Usuario[]> {
  return this.getAllUsers().pipe(
    tap(users => this.usersCache$.next(users))
  );
}
  
}
