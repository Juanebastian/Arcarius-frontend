import {
  Component,
  OnInit,
  AfterViewInit,
  AfterViewChecked,
  OnDestroy,
  ViewChildren,
  QueryList,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartType } from 'chart.js';
import { Subscription } from 'rxjs';
import { Usuario } from '../../../core/models/user.model';
import { Ticket } from '../../../core/models/ticket.model';
import { UserService } from '../../../core/services/user.service';
import { TicketService } from '../../../core/services/ticket.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [BaseChartDirective],
  templateUrl: './admin-dashboard.component.html',
})
export class AdminDashboardComponent
  implements OnInit, AfterViewInit, AfterViewChecked, OnDestroy
{
  @ViewChildren(BaseChartDirective) charts!: QueryList<BaseChartDirective>;
  @ViewChild('chartsWrapper', { static: true })
  chartsWrapper!: ElementRef<HTMLElement>;

  private subs = new Subscription();
  private resizeObserver?: ResizeObserver;
  private chartsUpdatedOnce = false;
  public dataLoaded = false;

  constructor(
    private userService: UserService,
    private ticketService: TicketService,
    private cdr: ChangeDetectorRef
  ) {}

  // 🎨 Paleta global suave/pastel
  private chartColors: string[] = [
    '#818CF8', // Indigo claro
    '#86EFAC', // Verde pastel
    '#FCA5A5', // Rojo suave
    '#FCD34D', // Amarillo suave
    '#93C5FD', // Azul pastel
    '#C4B5FD', // Violeta pastel
    '#F9A8D4', // Rosa pastel
    '#5EEAD4', // Turquesa suave
    '#D8B4FE', // Púrpura claro
    '#FDE68A', // Dorado suave
  ];

  // Opciones comunes
  public chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false, // 🔑 Ocupa todo el espacio del contenedor
    plugins: {
      legend: { position: 'top' },
    },
  };

  // === USUARIOS ===
  public barChartType: ChartType = 'bar';
  public barChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Usuarios registrados',
        backgroundColor: this.chartColors[0],
      },
    ],
  };

  public pieChartType: ChartType = 'pie';
  public pieChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: this.chartColors }],
  };

  // === TICKETS ===
  public ticketsEstadoChartType: ChartType = 'doughnut';
  public ticketsEstadoChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: this.chartColors }],
  };

  public ticketsPrioridadChartType: ChartType = 'polarArea';
  public ticketsPrioridadChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{ data: [], backgroundColor: this.chartColors }],
  };

  public ticketsPorUsuarioChartType: ChartType = 'bar';
  public ticketsPorUsuarioChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tickets por usuario',
        backgroundColor: this.chartColors[2],
      },
    ],
  };

  public ticketsPorMesChartType: ChartType = 'line';
  public ticketsPorMesChartData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [
      {
        data: [],
        label: 'Tickets creados',
        borderColor: this.chartColors[4],
        fill: true,
        backgroundColor: this.chartColors[4] + '33',
      },
    ],
  };

  ngOnInit(): void {
    // Usuarios
    const s1 = this.userService.getAllUsers().subscribe({
      next: (usuarios: Usuario[]) => {
        this.populateUserCharts(usuarios);
        this.dataLoaded = true;
        this.cdr.detectChanges();
        this.scheduleChartsUpdate();
      },
      error: (err) => console.error('❌ Error al cargar usuarios:', err),
    });
    this.subs.add(s1);

    // Tickets
    const s2 = this.ticketService.getAllTickets().subscribe({
      next: (tickets: Ticket[]) => {
        this.populateTicketCharts(tickets);
        this.dataLoaded = true;
        this.cdr.detectChanges();
        this.scheduleChartsUpdate();
      },
      error: (err) => console.error('❌ Error al cargar tickets:', err),
    });
    this.subs.add(s2);
  }

  private populateUserCharts(usuarios: Usuario[]) {
    const conteoMeses: { [mes: string]: number } = {};
    const conteoRoles: { [rol: number]: number } = {};

    usuarios.forEach((u) => {
      const mes = new Date(u.fecha_registro).toLocaleString('es-ES', {
        month: 'long',
      });
      conteoMeses[mes] = (conteoMeses[mes] || 0) + 1;
      conteoRoles[u.rol_id] = (conteoRoles[u.rol_id] || 0) + 1;
    });

    const mesesOrdenados = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];

    this.barChartData.labels = mesesOrdenados;
    this.barChartData.datasets[0].data = mesesOrdenados.map(
      (m) => conteoMeses[m] || 0
    );

    this.pieChartData.labels = Object.keys(conteoRoles).map((r) => `Rol ${r}`);
    this.pieChartData.datasets[0].data = Object.values(conteoRoles);
  }

  private populateTicketCharts(tickets: Ticket[]) {
    const estados: { [estado: string]: number } = {};
    const prioridades: { [prioridad: string]: number } = {};
    const ticketsPorUsuario: { [usuario: string]: number } = {};
    const ticketsPorMes: { [mes: string]: number } = {};

    tickets.forEach((t) => {
      estados[t.estado?.nombre] = (estados[t.estado?.nombre] || 0) + 1;
      prioridades[t.prioridad?.nombre] =
        (prioridades[t.prioridad?.nombre] || 0) + 1;
      ticketsPorUsuario[t.creadoPor?.nombre_completo] =
        (ticketsPorUsuario[t.creadoPor?.nombre_completo] || 0) + 1;

      const mes = new Date(t.fecha_creacion).toLocaleString('es-ES', {
        month: 'long',
      });
      ticketsPorMes[mes] = (ticketsPorMes[mes] || 0) + 1;
    });

    this.ticketsEstadoChartData.labels = Object.keys(estados);
    this.ticketsEstadoChartData.datasets[0].data = Object.values(estados);

    this.ticketsPrioridadChartData.labels = Object.keys(prioridades);
    this.ticketsPrioridadChartData.datasets[0].data = Object.values(prioridades);

    this.ticketsPorUsuarioChartData.labels = Object.keys(ticketsPorUsuario);
    this.ticketsPorUsuarioChartData.datasets[0].data =
      Object.values(ticketsPorUsuario);

    const mesesOrdenados = [
      'enero',
      'febrero',
      'marzo',
      'abril',
      'mayo',
      'junio',
      'julio',
      'agosto',
      'septiembre',
      'octubre',
      'noviembre',
      'diciembre',
    ];
    this.ticketsPorMesChartData.labels = mesesOrdenados;
    this.ticketsPorMesChartData.datasets[0].data = mesesOrdenados.map(
      (m) => ticketsPorMes[m] || 0
    );
  }

  private scheduleChartsUpdate() {
    requestAnimationFrame(() => {
      this.charts.forEach((ch) => {
        try {
          ch.update();
          ch.chart?.resize();
        } catch (e) {}
      });
    });
  }

  ngAfterViewInit(): void {
    try {
      this.resizeObserver = new ResizeObserver(() => {
        this.scheduleChartsUpdate();
      });
      if (this.chartsWrapper?.nativeElement) {
        this.resizeObserver.observe(this.chartsWrapper.nativeElement);
      }
    } catch (e) {}
  }

  ngAfterViewChecked(): void {
    if (this.dataLoaded && !this.chartsUpdatedOnce) {
      this.chartsUpdatedOnce = true;
      setTimeout(() => this.scheduleChartsUpdate(), 50);
      setTimeout(() => this.scheduleChartsUpdate(), 300);
    }
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    this.subs.unsubscribe();
  }
}
