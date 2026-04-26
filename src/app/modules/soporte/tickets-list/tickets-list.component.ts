import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../core/services/ticket.service';
import { Ticket } from '../../../core/models/ticket.model';
import { UserService } from '../../../core/services/user.service';
import { Usuario } from '../../../core/models/user.model';

@Component({
  selector: 'app-tickets-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tickets-list.component.html',
})
export class TicketsListComponent implements OnInit {

  /** ==========================
   *  🔹 Datos principales
   *  ========================== */
  tickets: any[] = [];          // Lista completa de tickets
  ticketsFiltrados: any[] = []; // Tickets filtrados según búsqueda/estado
  ticketsPagina: any[] = [];    // Tickets mostrados en la página actual
  cargando: boolean = false;    // Estado de carga
  usuariosFuncionarios: Usuario[] = [];
  /** ==========================
   *  🔹 Filtros
   *  ========================== */
  filtroTexto = '';                 // Texto ingresado en el input de búsqueda
  estadoSeleccionado: string | null = null; // Estado seleccionado en el filtro
 estadosSeleccionados: string[] = []; // Para múltiples estados
  /** ==========================
   *  🔹 Paginación
   *  ========================== */
  paginaActual = 1;   // Número de página actual
  itemsPorPagina = 5; // Cantidad de tickets por página
  totalPaginas = 1;   // Total de páginas disponibles

  /** ==========================
   *  🔹 Formulario
   *  ========================== */
  mostrarFormulario = false; // Controla la visibilidad del formulario
  modoAsignar = false;       // true = asignar, false = crear/editar
  ticketEditando: any = null; // Ticket actual en edición o asignación

  // Objeto temporal para el formulario de crear/editar/asignar
  nuevoTicket: any = { asunto: '', descripcion: '', prioridadId: null };

  constructor(
    private userService: UserService, 
    private ticketService: TicketService) {}

  /** ==========================
   *  🔹 Ciclo de vida
   *  ========================== */
  ngOnInit() {
    this.cargarTickets();
    this.cargarFuncionarios();
  }

  /** ==========================
   *  🔹 Métodos principales
   *  ========================== */

  // Cargar todos los tickets desde el servicio
  cargarTickets() {
    this.cargando = true;
    this.ticketService.getAllTickets().subscribe({
      next: (data) => {
        this.tickets = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        console.error('Error al cargar tickets');
        this.cargando = false;
      }
    });
  }

  // 👉 Abrir formulario en modo CREAR
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.modoAsignar = false;
    this.ticketEditando = null;
    this.nuevoTicket = { asunto: '', descripcion: '', prioridadId: null };
  }

  // 👉 Abrir formulario en modo ASIGNAR
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

  // Cerrar formulario
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.ticketEditando = null;
  }

  // Guardar ticket → crear o asignar según el modo
  guardarTicket() {
    if (this.modoAsignar && this.ticketEditando) {
      // 👉 ASIGNAR
      this.ticketService.asignarTicket(this.ticketEditando.id, this.nuevoTicket).subscribe({
        next: () => { this.cargarTickets(); this.cerrarFormulario(); },
        error: (err) => console.error('Error al asignar ticket', err)
      });
    } else {
      // 👉 CREAR
      this.ticketService.createTicket(this.nuevoTicket).subscribe({
        next: () => { this.cargarTickets(); this.cerrarFormulario(); },
        error: (err) => console.error('Error al crear ticket', err)
      });
    }
  }

  // 👉 Abrir formulario en modo EDITAR
  editarTicket(ticket: any) {
    this.ticketEditando = ticket;
    this.modoAsignar = false;
    this.nuevoTicket = { ...ticket };
    this.mostrarFormulario = true;
  }

  /** ==========================
   *  🔹 Filtros y búsqueda
   *  ========================== */

  // Filtrar tickets por estado
  filtrarPorEstado(estado: string | null) {
    this.estadoSeleccionado = estado;
    this.aplicarFiltro();
  }

  // Aplicar filtros por texto + estado
  aplicarFiltro() {
  this.ticketsFiltrados = this.tickets.filter(t => {
    // filtro por texto
    const coincideTexto =
      t.asunto.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      t.descripcion.toLowerCase().includes(this.filtroTexto.toLowerCase());

    // filtro por múltiples estados
    const coincideEstado =
      this.estadosSeleccionados.length > 0
        ? this.estadosSeleccionados.includes(t.estado?.nombre)
        : true;

    return coincideTexto && coincideEstado;
  });

  // Recalcular paginación
  this.totalPaginas = Math.ceil(this.ticketsFiltrados.length / this.itemsPorPagina) || 1;
  this.cambiarPagina(1);
}

onCheckboxChange(event: any, estado: string) {
  if (event.target.checked) {
    this.estadosSeleccionados.push(estado);
  } else {
    this.estadosSeleccionados = this.estadosSeleccionados.filter(e => e !== estado);
  }
  this.aplicarFiltro();
}
  // Detectar cambios en el input de búsqueda
  onFiltroChange() {
    this.aplicarFiltro();
  }

  /** ==========================
   *  🔹 Paginación
   *  ========================== */

  // Cambiar a una página específica
  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;

    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;

    this.ticketsPagina = this.ticketsFiltrados.slice(inicio, fin);
  }

  cargarFuncionarios() {
    this.userService.getUsersByRol(4).subscribe({
      next: (data) => {
        this.usuariosFuncionarios = data;
      },
      error: (err) => console.error('Error al cargar funcionarios', err)
    });
  }

  ticketSeleccionado: any = null;
mostrarModalDetalle = false;

abrirDetalleTicket(ticket: any) {
  this.ticketSeleccionado = ticket;
  this.mostrarModalDetalle = true;
}

cerrarDetalleTicket() {
  this.ticketSeleccionado = null;
  this.mostrarModalDetalle = false;
}
}
