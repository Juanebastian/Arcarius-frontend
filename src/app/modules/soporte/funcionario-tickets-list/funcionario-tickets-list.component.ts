import { Component, OnInit } from '@angular/core';
import { Ticket } from '../../../core/models/ticket.model';
import { TicketService } from '../../../core/services/ticket.service';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-funcionario-tickets-list',
  imports: [CommonModule, FormsModule],
  templateUrl: './funcionario-tickets-list.component.html',
  styleUrls: ['./funcionario-tickets-list.component.css']
})
export class FuncionarioTicketsListComponent implements OnInit {

  tickets: any[] = [];
  ticketsFiltrados: any[] = [];
  ticketsPagina: any[] = [];
  cargando: boolean = false;

  filtroTexto = '';
  estadoSeleccionado: string | null = null;

  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  mostrarFormulario = false;
  modoAsignar = false;
  ticketEditando: any = null;
  nuevoTicket: any = { asunto: '', descripcion: '', prioridadId: null };

  constructor(
    private ticketService: TicketService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    this.cargarTickets();
  }

  // Cargar solo los tickets asignados al usuario logueado
  cargarTickets() {
    const userId = this.authService.getUserId(); // obtener el ID del usuario actual

    if (!userId) {
      console.error('No se pudo obtener el ID del usuario');
      return;
    }

    this.cargando = true;

    this.ticketService.getTicketsAsignadosA(+userId).subscribe({
      next: (data) => {
        this.tickets = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar tickets del usuario', err);
        this.cargando = false;
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.modoAsignar = false;
    this.ticketEditando = null;
    this.nuevoTicket = { asunto: '', descripcion: '', prioridadId: null };
  }

  abrirAsignar(ticket: Ticket) {
    this.mostrarFormulario = true;
    this.modoAsignar = true;
    this.ticketEditando = ticket;
    this.nuevoTicket = {
      estadoId: ticket.estado?.id || 1,
      asignadoAId: ticket.asignadoA?.id || null,
      observaciones: ''
    };
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.ticketEditando = null;
  }

  guardarTicket() {
    if (this.modoAsignar && this.ticketEditando) {
      this.ticketService.asignarTicket(this.ticketEditando.id, this.nuevoTicket).subscribe({
        next: () => { this.cargarTickets(); this.cerrarFormulario(); },
        error: (err) => console.error('Error al asignar ticket', err)
      });
    } else {
      this.ticketService.createTicket(this.nuevoTicket).subscribe({
        next: () => { this.cargarTickets(); this.cerrarFormulario(); },
        error: (err) => console.error('Error al crear ticket', err)
      });
    }
  }

  editarTicket(ticket: any) {
    this.ticketEditando = ticket;
    this.modoAsignar = false;
    this.nuevoTicket = { ...ticket };
    this.mostrarFormulario = true;
  }

  filtrarPorEstado(estado: string | null) {
    this.estadoSeleccionado = estado;
    this.aplicarFiltro();
  }

  aplicarFiltro() {
    this.ticketsFiltrados = this.tickets.filter(t => {
      const coincideTexto =
        t.asunto.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        t.descripcion.toLowerCase().includes(this.filtroTexto.toLowerCase());
      const coincideEstado = this.estadoSeleccionado ? t.estado?.nombre === this.estadoSeleccionado : true;
      return coincideTexto && coincideEstado;
    });

    this.totalPaginas = Math.ceil(this.ticketsFiltrados.length / this.itemsPorPagina) || 1;
    this.cambiarPagina(1);
  }

  onFiltroChange() {
    this.aplicarFiltro();
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.ticketsPagina = this.ticketsFiltrados.slice(inicio, fin);
  }
}
