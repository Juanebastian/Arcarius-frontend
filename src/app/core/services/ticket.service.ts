// src/app/services/gasto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment.component';
import { Ticket, TicketCreate, TicketUpdate } from '../models/ticket.model';

@Injectable({
  providedIn: 'root',
})
export class TicketService {
  private apiUrl = environment.apiUrl;
  private ticketsUrl = `${this.apiUrl}/tickets`;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    });
  }

  /** Obtiene todos los tickets */
  getAllTickets(): Observable<Ticket[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket[]>(this.ticketsUrl, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener tickets:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene un ticket por ID */
  getTicketById(ticketId: number): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket>(`${this.ticketsUrl}/${ticketId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al obtener ticket por ID:', err);
        return throwError(() => err);
      })
    );
  }

  /** Crea un nuevo ticket */
  createTicket(data: Partial<TicketCreate>): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.post<Ticket>(this.ticketsUrl, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al crear ticket:', err);
        return throwError(() => err);
      })
    );
  }

  /** Actualiza un ticket */
  updateTicket(ticketId: number, data: Partial<Ticket>): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.put<Ticket>(`${this.ticketsUrl}/${ticketId}`, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al actualizar ticket:', err);
        return throwError(() => err);
      })
    );
  }

  /** Elimina un ticket */
  deleteTicket(ticketId: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.ticketsUrl}/${ticketId}`, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al eliminar ticket:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene todos los tickets de un proyecto por su ID de proyecto*/
  getTicketsPorProyecto(proyectoId: number): Observable<Ticket[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Ticket[]>(`${this.ticketsUrl}/proyecto/${proyectoId}`, { headers }).pipe(
      catchError((err) => {
        console.error(`❌ Error al obtener tickets del proyecto ${proyectoId}:`, err);
        return throwError(() => err);
      })
    );
  }

  /** Asigna un ticket a un usuario y cambia estado */
  asignarTicket(ticketId: number, data: Partial<TicketUpdate>): Observable<Ticket> {
    const headers = this.getAuthHeaders();
    return this.http.put<Ticket>(`${this.ticketsUrl}/${ticketId}`, data, { headers }).pipe(
      catchError((err) => {
        console.error('❌ Error al asignar ticket:', err);
        return throwError(() => err);
      })
    );
  }

  /** Obtiene todos los tickets asignados a un usuario por su ID */
getTicketsAsignadosA(usuarioId: number): Observable<Ticket[]> {
  const headers = this.getAuthHeaders();
  return this.http
    .get<Ticket[]>(`${this.ticketsUrl}/asignado/${usuarioId}`, { headers })
    .pipe(
      catchError((err) => {
        console.error(`❌ Error al obtener tickets asignados al usuario ${usuarioId}:`, err);
        return throwError(() => err);
      })
    );
}


}
