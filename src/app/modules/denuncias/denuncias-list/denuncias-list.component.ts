import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Denuncia } from '../../../core/models/denuncia.model';
import { DenunciaService } from '../../../core/services/denuncia.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-denuncias-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './denuncias-list.component.html',
  styleUrls: ['./denuncias-list.component.css'],
})
export class DenunciasListComponent implements OnInit {
  denuncias: Denuncia[] = [];
  denunciasFiltradas: Denuncia[] = [];
  denunciasPagina: Denuncia[] = [];

  // estados
  loading = true;
  error: string | null = null;

  // filtro y paginación
  filtroTexto = '';
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  // modales
  mostrarModalDetalle = false;
  mostrarFormulario = false;
  denunciaSeleccionada: Denuncia | null = null;
  denunciaEditando: Denuncia | null = null;
  nuevaDenuncia: Partial<Denuncia> = {};

  constructor(
    private denunciaService: DenunciaService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.cargarDenuncias();
  }

  cargarDenuncias(): void {
    this.loading = true;
    this.denunciaService.getAllDenuncias().subscribe({
      next: (data) => {
        this.denuncias = data;
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (err) => {
        console.error('❌ Error al cargar denuncias', err);
        this.error = 'No se pudieron cargar las denuncias.';
        this.loading = false;
      },
    });
  }

  aplicarFiltro() {
    this.denunciasFiltradas = this.denuncias.filter(
      (d) =>
        d.descripcion?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
        d.estado?.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
    this.totalPaginas =
      Math.ceil(this.denunciasFiltradas.length / this.itemsPorPagina) || 1;
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
    this.denunciasPagina = this.denunciasFiltradas.slice(inicio, fin);
  }

  // Modales
  abrirDetalle(denuncia: Denuncia) {
    this.denunciaSeleccionada = denuncia;
    this.mostrarModalDetalle = true;
  }
  cerrarDetalle() {
    this.mostrarModalDetalle = false;
    this.denunciaSeleccionada = null;
  }

  editarDenuncia(denuncia: Denuncia) {
    this.denunciaEditando = denuncia;
    this.nuevaDenuncia = { ...denuncia };
    this.mostrarFormulario = true;
  }
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.denunciaEditando = null;
  }

  guardarDenuncia() {
    if (this.denunciaEditando) {
      // 🔵 EDITAR
      this.denunciaService
        .updateDenuncia(this.denunciaEditando.id, this.nuevaDenuncia)
        .subscribe({
          next: () => {
            this.cargarDenuncias();
            this.cerrarFormulario();
          },
          error: (err) => console.error('❌ Error al actualizar denuncia', err),
        });
    } else {
      // 🟢 CREAR
      const usuarioId = this.authService.getUsuarioId(); // <-- aquí sacamos el ID

      const payload = {
        ciudadanoId: this.nuevaDenuncia.anonima ? null : usuarioId, // 👈 si no es anónima, mandamos el id
        asunto: this.nuevaDenuncia.asunto!,
        descripcion: this.nuevaDenuncia.descripcion!,
        anonima: this.nuevaDenuncia.anonima ?? false,
      };

      this.denunciaService.createDenuncia(payload).subscribe({
        next: () => {
          this.cargarDenuncias();
          this.cerrarFormulario();
        },
        error: (err) => console.error('❌ Error al crear denuncia', err),
      });
    }
  }
}
