import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Auditoria } from '../../../core/models/auditoria.model';
import { AuditoriaService } from '../../../core/services/auditoria.service';


@Component({
  selector: 'app-admin-auditorias',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './admin-auditorias.component.html',
  styleUrls: ['./admin-auditorias.component.css']
})
export class AdminAuditoriasComponent implements OnInit {

  auditorias: Auditoria[] = [];
  auditoriasFiltradas: Auditoria[] = [];
  auditoriasPagina: Auditoria[] = [];

  cargando = false;
  error: string | null = null;

  filtroTexto = '';
  paginaActual = 1;
  itemsPorPagina = 5;
  totalPaginas = 1;

  constructor(private auditoriaService: AuditoriaService) {}

  ngOnInit() {
    this.cargarAuditorias();
  }

  cargarAuditorias() {
    this.cargando = true;
    this.auditoriaService.getAllAuditorias().subscribe({
      next: (data: Auditoria[]) => {
        this.auditorias = data;
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: () => {
        this.error = '❌ Error al cargar auditorías';
        this.cargando = false;
      }
    });
  }

  aplicarFiltro() {
    this.auditoriasFiltradas = this.auditorias.filter(a =>
      a.descripcion.toLowerCase().includes(this.filtroTexto.toLowerCase())
    );
    this.totalPaginas = Math.ceil(this.auditoriasFiltradas.length / this.itemsPorPagina);
    this.cambiarPagina(1);
  }

  cambiarPagina(pagina: number) {
    this.paginaActual = pagina;
    const inicio = (pagina - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    this.auditoriasPagina = this.auditoriasFiltradas.slice(inicio, fin);
  }
}
