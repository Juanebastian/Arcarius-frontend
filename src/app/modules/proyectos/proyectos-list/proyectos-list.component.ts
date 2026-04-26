import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ProyectoService } from '../../../core/services/proyecto.service';
import { Proyecto } from '../../../core/models/proyecto.model';
import { GastoService } from '../../../core/services/gasto.service';
import { Gasto } from '../../../core/models/gasto.model';
import { AuditoriaService } from '../../../core/services/auditoria.service';
import { Auditoria, AuditoriaCreate } from '../../../core/models/auditoria.model';
import { AuthService } from '../../../core/services/auth.service';
import { ProyectoDocumentoService } from '../../../core/services/proyecto-documento.service';
import { ProyectoDocumento } from '../../../core/models/proyecto-documento.model';

@Component({
  selector: 'app-proyectos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './proyectos-list.component.html',
  styleUrls: ['./proyectos-list.component.css']
})
export class ProyectosListComponent implements OnInit {

  // Lista de proyectos obtenidos desde el servicio
  proyectos: Proyecto[] = [];
  // Lista filtrada de proyectos según el buscador
  proyectosFiltrados: Proyecto[] = [];
  // Proyectos visibles en la página actual (paginación)
  proyectosPagina: Proyecto[] = [];

  // Estados de control
  cargando = false;
  error: string | null = null;
  mostrarFormulario = false; // Para mostrar/ocultar el formulario de proyectos
  proyectoEditando: Proyecto | null = null; // Proyecto que se está editando

  // Datos para crear/editar un proyecto
  nuevoProyecto: Partial<Proyecto> = {};

  // Variables para filtros y paginación
  filtroTexto = '';
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // Variables para gastos
  mostrarModalGasto = false;
  mostrarFormularioGasto = false;
  proyectoSeleccionado: Proyecto | null = null; // Proyecto al que se asignan los gastos
  nuevoGasto: Partial<Gasto> = {}; // Formulario de nuevo gasto
  gastosProyecto: any[] = []; // Lista de gastos del proyecto seleccionado

  // ================== MANEJO DE DOCUMENTOS ==================
mostrarModalDocumentos = false;

nuevoDocumento: { file?: File; tipo: string } = { tipo: '' };

documentosProyecto: ProyectoDocumento[] = [];


constructor(
  private authService: AuthService,
  private proyectosService: ProyectoService,
  private gastoService: GastoService,
  private auditoriaService: AuditoriaService,
  private proyectoDocumentoService: ProyectoDocumentoService // ⚡ agregado
) {}


  /**
   * Ciclo de vida de Angular: se ejecuta al inicializar el componente.
   * Carga todos los proyectos desde el backend.
   */
  ngOnInit() {
    this.cargarProyectos();
  }

  /**
   * Cargar proyectos desde el servicio.
   */
  cargarProyectos() {
    this.cargando = true;
    this.error = null;

    this.proyectosService.getAllProyectos().subscribe({
      next: (data: Proyecto[]) => {
        this.proyectos = data;
        this.aplicarFiltro(); // Filtra y actualiza la paginación
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar proyectos';
        this.cargando = false;
      }
    });
  }

  /**
   * Abre el formulario para crear un nuevo proyecto.
   */
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.proyectoEditando = null;
    this.nuevoProyecto = this.proyectoVacio();
  }

  /**
   * Cierra el formulario de proyectos.
   */
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.proyectoEditando = null;
  }

  /**
   * Retorna un objeto vacío con la estructura de un proyecto.
   */
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


  
  /**
   * Guarda un proyecto (crear o actualizar).
   */
  guardarProyecto() {
    if (this.proyectoEditando?.id != null) {
      // Editar proyecto existente
      this.proyectosService.updateProyecto(this.proyectoEditando.id, this.nuevoProyecto).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cerrarFormulario();
        },
        error: () => {
          this.error = 'Error al actualizar el proyecto';
        }
      });
    } else {
      // Crear nuevo proyecto
      this.proyectosService.createProyecto(this.nuevoProyecto).subscribe({
        next: () => {
          this.cargarProyectos();
          this.cerrarFormulario();
        },
        error: () => {
          this.error = 'Error al crear el proyecto';
        }
      });
    }
  }

  /**
   * Carga los datos de un proyecto en el formulario para su edición.
   */
  editarProyecto(proyecto: Proyecto) {
    this.proyectoEditando = proyecto;
    this.nuevoProyecto = { ...proyecto };
    this.mostrarFormulario = true;
  }

  /**
   * Aplica el filtro de búsqueda sobre la lista de proyectos.
   * También recalcula la paginación.
   */
  aplicarFiltro() {
    this.proyectosFiltrados = this.proyectos.filter(p =>
      p.nombre.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      (p.descripcion && p.descripcion.toLowerCase().includes(this.filtroTexto.toLowerCase()))
    );

    this.totalPaginas = Math.ceil(this.proyectosFiltrados.length / this.itemsPorPagina) || 1;
    this.cambiarPagina(1);
  }

  /**
   * Evento cuando el filtro cambia (input del usuario).
   */
  onFiltroChange() {
    this.aplicarFiltro();
  }

  /**
   * Cambia la página de la tabla de proyectos.
   */
  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.proyectosPagina = this.proyectosFiltrados.slice(inicio, fin);
  }

  // ================== MANEJO DE GASTOS ==================

  /**
   * Abre el modal de gastos de un proyecto específico.
   */
  abrirModalGastos(proyecto: Proyecto) {
    this.proyectoSeleccionado = proyecto;
    this.mostrarModalGasto = true;
    this.cargarGastos(proyecto.id);
  }

  /**
   * Abre el formulario para agregar un gasto al proyecto seleccionado.
   */
  abrirFormularioGasto(proyecto: Proyecto) {
    this.proyectoSeleccionado = proyecto;
    this.nuevoGasto = {};
    this.mostrarFormularioGasto = true;
  }

  /**
   * Cierra el modal de gastos.
   */
  cerrarModalGastos() {
    this.mostrarModalGasto = false;
    this.proyectoSeleccionado = null;
    this.gastosProyecto = [];
  }

  /**
   * Cierra el formulario de gasto.
   */
  cerrarFormularioGasto() {
    this.mostrarFormularioGasto = false;
    this.proyectoSeleccionado = null;
    this.nuevoGasto = {};
  }

  /**
   * Carga los gastos asociados a un proyecto.
   */
  cargarGastos(proyectoId: number) {
    this.gastoService.getGastosPorProyecto(proyectoId).subscribe({
      next: (data) => {
        this.gastosProyecto = data;
      },
      error: (err) => console.error('Error al cargar gastos:', err)
    });
  }

  /**
   * Guarda un nuevo gasto asociado al proyecto seleccionado.
   */
  guardarGasto() {
    if (!this.proyectoSeleccionado?.id) return;

    const gasto: Gasto = {
      ...this.nuevoGasto,
      proyectoId: this.proyectoSeleccionado.id
    } as Gasto;

    this.gastoService.createGasto(gasto).subscribe({
      next: () => {
        this.cargarGastos(this.proyectoSeleccionado!.id);
        this.nuevoGasto = {}; // limpiar formulario
      },
      error: (err) => console.error('Error al guardar gasto:', err)
    });
  }


mostrarModalDetalle = false;

abrirDetalleProyecto(proyecto: Proyecto) {
  this.proyectoSeleccionado = proyecto;
  this.mostrarModalDetalle = true;
}

cerrarDetalleProyecto() {
  this.mostrarModalDetalle = false;
  this.proyectoSeleccionado = null;
}

mostrarFormularioAuditoria = false;
nuevaAuditoria: AuditoriaCreate = {
  descripcion: '',
  estado: 'En proceso',
  entidad_control: 'Contraloría General',
  proyectoId: 0,
  generadoPorId: 0,
  aprobadoPorId: 0
};

// Abrir formulario de auditoría
registrarAuditoria(proyecto: Proyecto) {
  const usuarioActualId = this.authService.getUsuarioId(); // ⚡ lo sacas del login
  this.proyectoSeleccionado = proyecto;

  this.nuevaAuditoria = {
    descripcion: '',
    estado: 'En proceso',
    entidad_control: 'Contraloría General',
    proyectoId: proyecto.id,
    generadoPorId: usuarioActualId,  // ⚡ usuario que registra
    aprobadoPorId: usuarioActualId                 // ⚡ lo llena el form
  };

  this.mostrarFormularioAuditoria = true;
}

// Cerrar formulario
cerrarFormularioAuditoria() {
  this.mostrarFormularioAuditoria = false;
}

// Guardar auditoría
guardarAuditoria() {
  this.auditoriaService.createAuditoria(this.nuevaAuditoria).subscribe({
    next: () => {
      alert(`✅ Auditoría registrada para ${this.proyectoSeleccionado?.nombre}`);
      this.cerrarFormularioAuditoria();
    },
    error: (err) => {
      console.error('❌ Error al registrar auditoría:', err);
      alert('Error al registrar auditoría');
    }
  });
}


// ====== MANEJO DE AUDITORÍAS ======
mostrarModalAuditorias = false;
auditoriasProyecto: Auditoria[] = [];

abrirModalAuditorias(proyecto: Proyecto) {
  this.proyectoSeleccionado = proyecto;
  this.mostrarModalAuditorias = true;
  this.cargarAuditorias(proyecto.id);
}

cerrarModalAuditorias() {
  this.mostrarModalAuditorias = false;
  this.auditoriasProyecto = [];
  this.proyectoSeleccionado = null;
}

cargarAuditorias(proyectoId: number) {
  this.auditoriaService.getAuditoriasPorProyecto(proyectoId).subscribe({
    next: (data) => {
      this.auditoriasProyecto = data;
    },
    error: (err) => {
      console.error('❌ Error al cargar auditorías:', err);
    }
  });
}



abrirModalDocumentos(proyecto: Proyecto) {
  this.proyectoSeleccionado = proyecto;
  this.mostrarModalDocumentos = true;
  this.cargarDocumentos(proyecto.id);
}

cerrarModalDocumentos() {
  this.mostrarModalDocumentos = false;
  this.proyectoSeleccionado = null;
  this.documentosProyecto = [];
  this.nuevoDocumento = { tipo: '' };
}


 cargarDocumentos(proyectoId: number) {
  this.proyectoDocumentoService.getDocumentosByProyecto(proyectoId).subscribe({
    next: (data) => this.documentosProyecto = data,
    error: (err) => console.error('❌ Error al cargar documentos:', err),
  });
}


seleccionarArchivo(event: Event) {
  const input = event.target as HTMLInputElement;

  if (input.files?.length) {
    this.nuevoDocumento.file = input.files[0];

    // Detectar extensión del archivo
    const nombreArchivo = this.nuevoDocumento.file.name;
    const extension = nombreArchivo.split('.').pop()?.toLowerCase();

    // Asignar al campo tipo automáticamente
    this.nuevoDocumento.tipo = extension || 'desconocido';
  }
}




subirDocumento() {
  if (!this.nuevoDocumento.file || !this.proyectoSeleccionado) {
    console.error('⚠️ Falta archivo o proyecto seleccionado');
    return;
  }

  this.proyectoDocumentoService.uploadDocumento(
    this.proyectoSeleccionado.id,
    this.nuevoDocumento.file,
    this.nuevoDocumento.tipo,
    this.authService.getUsuarioId()
  ).subscribe({
    next: (doc) => {
      console.log('✅ Documento subido:', doc);
      this.documentosProyecto.push(doc);
      this.nuevoDocumento = { tipo: '' }; // limpiar form
    },
    error: (err) => console.error('❌ Error al subir documento:', err)
  });
}




descargarDocumento(hashArchivo: string) {
  this.proyectoDocumentoService.downloadDocumento(hashArchivo).subscribe({
    next: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = hashArchivo;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error: (err) => console.error('❌ Error al descargar documento:', err)
  });
}

}
