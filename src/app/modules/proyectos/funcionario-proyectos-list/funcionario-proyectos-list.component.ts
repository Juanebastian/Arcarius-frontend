import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';
import { GastoService } from '../../../core/services/gasto.service';
import { Gasto } from '../../../core/models/gasto.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-proyectos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './funcionario-proyectos-list.component.html',
  styleUrls: ['./funcionario-proyectos-list.component.css']
})
export class FuncionarioProyectosListComponent implements OnInit {

  proyectos: Proyecto[] = [];
  proyectosFiltrados: Proyecto[] = [];
  proyectosPagina: Proyecto[] = [];

  cargando = false;
  error: string | null = null;
  mostrarFormulario = false;
  proyectoEditando: Proyecto | null = null;
  nuevoProyecto: Partial<Proyecto> = {};

  filtroTexto = '';
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  mostrarModalGasto = false;
  mostrarFormularioGasto = false;
  proyectoSeleccionado: Proyecto | null = null;
  nuevoGasto: Partial<Gasto> = {};
  gastosProyecto: any[] = [];

  constructor(
    private proyectosService: ProyectoService,
    private gastoService: GastoService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const usuarioIdStr = this.authService.getUserId();
    if (!usuarioIdStr) {
      this.error = 'No se pudo determinar el usuario autenticado';
      return;
    }
    const usuarioId = Number(usuarioIdStr);
    this.cargarProyectosUsuario(usuarioId);
  }

  /** Cargar proyectos registrados por el usuario autenticado */
  cargarProyectosUsuario(usuarioId: number) {
    this.cargando = true;
    this.error = null;

    this.proyectosService.getProyectosPorUsuario(usuarioId).subscribe({
      next: (data: Proyecto[]) => {
        this.proyectos = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar proyectos del usuario';
        this.cargando = false;
      }
    });
  }

  abrirFormulario() {
    this.mostrarFormulario = true;
    this.proyectoEditando = null;
    this.nuevoProyecto = this.proyectoVacio();
  }

  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.proyectoEditando = null;
  }

  proyectoVacio(): Partial<Proyecto> {
    return {
      nombre: '',
      descripcion: '',
      entidadResponsable: '',
      fechaInicio: '',
      fechaFin: '',
      presupuesto: 0,
      estado: 'Planeado'
    };
  }

  guardarProyecto() {
    if (this.proyectoEditando?.id != null) {
      this.proyectosService.updateProyecto(this.proyectoEditando.id, this.nuevoProyecto).subscribe({
        next: () => {
          const usuarioId = Number(this.authService.getUserId());
          this.cargarProyectosUsuario(usuarioId);
          this.cerrarFormulario();
        },
        error: () => {
          this.error = 'Error al actualizar el proyecto';
        }
      });
    } else {
      this.proyectosService.createProyecto(this.nuevoProyecto).subscribe({
        next: () => {
          const usuarioId = Number(this.authService.getUserId());
          this.cargarProyectosUsuario(usuarioId);
          this.cerrarFormulario();
        },
        error: () => {
          this.error = 'Error al crear el proyecto';
        }
      });
    }
  }

  editarProyecto(proyecto: Proyecto) {
    this.proyectoEditando = proyecto;
    this.nuevoProyecto = { ...proyecto };
    this.mostrarFormulario = true;
  }

  aplicarFiltro() {
    this.proyectosFiltrados = this.proyectos.filter(p =>
      p.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(this.filtroTexto.toLowerCase()))
    );

    this.totalPaginas = Math.ceil(this.proyectosFiltrados.length / this.itemsPorPagina) || 1;
    this.cambiarPagina(1);
  }

  onFiltroChange() {
    this.aplicarFiltro();
  }

  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.proyectosPagina = this.proyectosFiltrados.slice(inicio, fin);
  }

  abrirModalGastos(proyecto: Proyecto) {
    this.proyectoSeleccionado = proyecto;
    this.mostrarModalGasto = true;
    this.cargarGastos(proyecto.id);
  }

  abrirFormularioGasto(proyecto: Proyecto) {
    this.proyectoSeleccionado = proyecto;
    this.nuevoGasto = {};
    this.mostrarFormularioGasto = true;
  }

  cerrarModalGastos() {
    this.mostrarModalGasto = false;
    this.proyectoSeleccionado = null;
    this.gastosProyecto = [];
  }

  cerrarFormularioGasto() {
    this.mostrarFormularioGasto = false;
    this.proyectoSeleccionado = null;
    this.nuevoGasto = {};
  }

  cargarGastos(proyectoId: number) {
    this.gastoService.getGastosPorProyecto(proyectoId).subscribe({
      next: (data) => {
        this.gastosProyecto = data;
      },
      error: (err) => console.error('Error al cargar gastos:', err)
    });
  }

  guardarGasto() {
    if (!this.proyectoSeleccionado?.id) return;

    const gasto: Gasto = {
      ...this.nuevoGasto,
      proyectoId: this.proyectoSeleccionado.id
    } as Gasto;

    this.gastoService.createGasto(gasto).subscribe({
      next: () => {
        this.cargarGastos(this.proyectoSeleccionado!.id);
        this.nuevoGasto = {};
      },
      error: (err) => console.error('Error al guardar gasto:', err)
    });
  }
}
