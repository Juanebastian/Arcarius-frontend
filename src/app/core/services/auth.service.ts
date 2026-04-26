import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { environment } from '../../../environments/environment.component';

// 📌 Interfaz del usuario devuelto por el backend
interface Usuario {
  id: number;
  email: string;
  rol: {
    id: number;
    nombre: string;
  };
}

// 📌 Estructura de la respuesta esperada en login
interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    access_token: string; // Token JWT emitido por el backend
    token_type: string;   // Tipo de token (generalmente "Bearer")
    usuario: Usuario;     // Datos del usuario autenticado
  };
  timestamp: string;
  path: string;
}

@Injectable({
  providedIn: 'root' // 👈 Se inyecta en toda la aplicación automáticamente
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`; // URL base de autenticación
  private authState = new BehaviorSubject<boolean>(false); // Estado de login (reactivo)

  constructor(
    private http: HttpClient,             // Cliente HTTP para llamadas al backend
    private router: Router,               // Para redirecciones tras login/logout
    @Inject(PLATFORM_ID) private platformId: Object // Detecta si corre en navegador o servidor
  ) {
    // Al iniciar, si estamos en navegador, revisamos si hay token guardado
    if (isPlatformBrowser(this.platformId)) {
      this.authState.next(this.hasToken());
    }
  }

  /**
   * 🔹 Inicia sesión contra el backend.
   * Guarda el token si es válido y actualiza el estado de autenticación.
   */
  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(response => {
        if (response.success && response.data?.access_token) {
          this.saveToken(response.data.access_token); // Guardamos token en localStorage
          this.authState.next(true); // Marcamos usuario como autenticado
        } else {
          throw new Error(response.message || 'Error al iniciar sesión');
        }
      }),
      catchError(error => {
        console.error('Error en login:', error);
        const message = error?.error?.message || error?.message || 'Error al iniciar sesión';
        return throwError(() => ({ message }));
      })
    );
  }

  /**
   * 🔹 Cierra la sesión:
   * - Elimina el token
   * - Cambia estado de autenticación
   * - Redirige a /login
   */
  logout(): void {
    this.clearToken();
    this.authState.next(false);
    this.router.navigateByUrl('/login', { replaceUrl: true });
  }

  /**
   * 🔹 Devuelve un observable con el estado de autenticación (true/false)
   */
  isAuthenticated(): Observable<boolean> {
    return this.authState.asObservable();
  }

  /**
   * 🔹 Obtiene el token almacenado en localStorage
   */
  getToken(): string | null {
    return typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  }

  /**
   * 🔹 Guarda el token en localStorage
   */
  private saveToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  /**
   * 🔹 Devuelve información del usuario decodificada desde el JWT
   */
  getUserInfo(): any {
    return this.getDecodedToken();
  }

  /**
   * 🔹 Devuelve el `sub` del JWT (generalmente el ID del usuario)
   */
  getUserId(): string | null {
    const user = this.getDecodedToken();
    return user?.sub || null; // 👈 el `sub` viene en el payload del JWT
  }
  

  getUsuarioId(): number {
  const decoded = this.getDecodedToken();
  return decoded?.sub ? Number(decoded.sub) : 0;
}



  /**
   * 🔹 Elimina el token del almacenamiento
   */
  private clearToken(): void {
    localStorage.removeItem('auth_token');
  }

  /**
   * 🔹 Verifica si existe un token guardado
   */
  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  /**
   * 🔹 Decodifica el JWT usando `jwt-decode`
   */
  getDecodedToken(): any | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      return jwtDecode<any>(token);
    } catch (error) {
      console.error('Error al decodificar el token JWT:', error);
      return null;
    }
  }

  /**
   * 🔹 Obtiene el rol del usuario a partir del JWT y lo convierte a un ID numérico.
   * Esto facilita manejar roles de forma consistente en frontend.
   */
  getUserRole(): number {
    const user = this.getDecodedToken();
    if (!user) return 0;

    // 👇 Normalizamos el rol a número
    switch (user.rol?.toLowerCase()) {
      case 'ciudadano':
        return 1;
      case 'funcionario':
        return 2;
      case 'auditor':
        return 3;
      case 'administrador':
        return 4;
      default:
        return 0; // Sin rol o desconocido
    }
  }

  /**
 * 🔹 Devuelve el nombre legible del rol a partir del ID.
 */
getUserRoleName(): string {
  const roleId = this.getUserRole();

  switch (roleId) {
    case 1:
      return 'Ciudadano';
    case 2:
      return 'Funcionario';
    case 3:
      return 'Auditor';
    case 4:
      return 'Administrador';
    default:
      return 'Sin rol';
  }
}
}
