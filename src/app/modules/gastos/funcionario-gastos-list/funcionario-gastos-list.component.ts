import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GastoService } from '../../../core/services/gasto.service';
import { Gasto } from '../../../core/models/gasto.model';
import { AuthService } from '../../../core/services/auth.service'; // 👈 Importamos AuthService

@Component({
  selector: 'app-gastos-list',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './funcionario-gastos-list.component.html',
  styleUrls: ['./funcionario-gastos-list.component.css']
})
export class FuncionarioGastosListComponent implements OnInit {

  gastos: Gasto[] = [];
  gastosFiltrados: Gasto[] = [];
  gastosPagina: Gasto[] = [];

  cargando = false;
  error: string | null = null;

  filtroTexto = '';
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  constructor(
    private gastoService: GastoService,
    private authService: AuthService // 👈 Inyectamos AuthService
  ) {}

  ngOnInit() {
    this.cargarGastos();
  }

  cargarGastos() {
    this.cargando = true;
    this.error = null;

    // 🔹 Obtenemos el ID del usuario logueado desde el token
    const userId = this.authService.getUserId();
    if (!userId) {
      this.error = 'No se pudo obtener el usuario autenticado';
      this.cargando = false;
      return;
    }

    // 🔹 Cargamos solo sus gastos
    this.gastoService.getGastosPorUsuario(Number(userId)).subscribe({
      next: (data: Gasto[]) => {
        this.gastos = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar gastos';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro() {
    this.gastosFiltrados = this.gastos.filter(g =>
      g.descripcion?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      g.proyecto?.nombre?.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      g.registradoPor?.nombre_completo?.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );

    this.totalPaginas = Math.ceil(this.gastosFiltrados.length / this.itemsPorPagina) || 1;
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
    this.gastosPagina = this.gastosFiltrados.slice(inicio, fin);
  }
}
