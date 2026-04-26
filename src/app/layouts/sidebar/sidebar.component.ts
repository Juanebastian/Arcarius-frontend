// sidebar.component.ts

import { Component, Input, signal, computed, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription, interval } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { TicketService } from '../../core/services/ticket.service';
import { Ticket } from '../../core/models/ticket.model';


interface NavItem {
  path: string;
  icon: string;            // aquí guardaremos la ruta SVG
  label: string;
  children?: NavItem[];
  exact?: boolean;
  requiredRole?: number;   // 1 = administrador, 2 = técnico, 3 = colaborador
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  // Sólo guardamos los contadores (nunca la lista completa).
  ticketsAbiertosCount = signal<number>(0);
  ticketsEnProcesoByTecCount = signal<number>(0);

  // Estado de carga / error para el badge
  cargandoCount = signal<boolean>(false);
  errorCount = signal<string>('');

  // Rol del usuario (1=administrador, 2=técnico, 3=colaborador)
  rolUsuario = signal<number>(0);
  rolNombre: string = '';
  private subscriptions = new Subscription();

  private authService: AuthService = inject(AuthService);
  private ticketService = inject(TicketService);
  constructor(
    
  ) {}
  

  private router = inject(Router);

  @Input() collapsed = false;

  // Control de submenús "abiertos"
  readonly expandedMenus = signal<Set<string>>(new Set());
  readonly hoveredItem = signal<string | null>(null);
  readonly shouldShowTooltip = computed(() => this.collapsed);

  readonly navItems: NavItem[] = [
  // ––––––– Administrador –––––––––
  {
    path: '/administrador/home',
    icon: 'M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z', 
    label: 'Dashboard',
    requiredRole: 4,
    exact: true,
  },
  {
    path: '/administrador/listar-usuarios',
    icon: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zm-9 8a6 6 0 1112 0H6z',
    label: 'Usuarios',
    requiredRole: 4,
  },
  {
    path: '/administrador/proyectos',
    icon: 'M4 6h16M4 12h16M4 18h16',
    label: 'Proyectos',
    requiredRole: 4,
    children: [
      {
        path: '/administrador/listar-proyectos',
        icon: 'M9 17V7h6v10H9z', 
        label: 'Todos los proyectos'
      },
      {
        path: '/administrador/listar-gastos',
        icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4h5a2 2 0 002-2v-1a2 2 0 00-2-2h-5z', 
        label: 'Gastos'
      }
    ]
  },
  {
    path: '/administrador/listar-tickets',
    icon: 'M4 6h16v12H4z', 
    label: 'Mesa De Ayuda',
    requiredRole: 4
  },
  {
    path: '/administrador/denuncias',
    icon: 'M12 2l9 4v6c0 5-4 9-9 9s-9-4-9-9V6l9-4z',
    label: 'Denuncias',
    requiredRole: 4
  },
  {
    path: '/administrador/auditorias',
    icon: 'M12 20.25c4.56 0 8.25-3.69 8.25-8.25S16.56 3.75 12 3.75 3.75 7.44 3.75 12 7.44 20.25 12 20.25z',
    label: 'Auditorías',
    requiredRole: 4
  },

  // ––––––– Funcionario –––––––––
  {
    path: '/funcionarios/home',
    icon: 'M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z', 
    label: 'Dashboard',
    exact: true,
    requiredRole: 2
  },
  {
    path: '/funcionarios/proyectos',
    icon: 'M4 6h16M4 12h16M4 18h16',
    label: 'Proyectos',
    requiredRole: 2,
    children: [
      {
        path: '/funcionarios/listar-proyectos',
        icon: 'M9 17V7h6v10H9z', 
        label: 'Todos los proyectos'
      },
      {
        path: '/funcionarios/listar-gastos',
        icon: 'M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4h5a2 2 0 002-2v-1a2 2 0 00-2-2h-5z', 
        label: 'Gastos'
      }
    ]
  },
  {
    path: '/funcionarios/listar-tickets',
    icon: 'M4 6h16v12H4z', 
    label: 'Mesa De Ayuda',
    requiredRole: 2
  },

  // ––––––– Ciudadanos –––––––––
  {
    path: '/ciudadanos/home',
    icon: 'M3 9.75L12 3l9 6.75V21a.75.75 0 01-.75.75H3.75A.75.75 0 013 21V9.75z', 
    label: 'Dashboard',
    exact: true,
    requiredRole: 1
  },
  {
    path: '/ciudadanos/tickets',
    icon: 'M4 6h16v12H4z', 
    label: 'Mesa De Ayuda',
    requiredRole: 1
  },

  // ––––––– Todos –––––––––
  {
    path: '/reports',
    icon: 'M3 3h18v4H3V3zm0 7h18v4H3v-4zm0 7h18v4H3v-4z', 
    label: 'Reportes'
  }
];


  // Filtra ítems según el rol actual
  readonly filteredNavItems = computed(() => {
    const rol = this.rolUsuario();
    console.log('Calculando filteredNavItems para rol:', rol); // Debug
    return this.navItems.filter(item => {
      if (!item.requiredRole) return true;
      return item.requiredRole === rol;
    });
  });

  ngOnInit(): void {
    const roleNumber = this.authService.getUserRole();
    this.rolUsuario.set(roleNumber);
this.rolNombre = this.authService.getUserRoleName();
     this.cargarContadores();
  }

  

  // Métodos auxiliares (submenús, hover, active, etc.)
  toggleSubmenu(path: string) {
    const expanded = this.expandedMenus();
    const clone = new Set(expanded);
    if (clone.has(path)) clone.delete(path);
    else clone.add(path);
    this.expandedMenus.set(clone);
  }

  isSubmenuExpanded(path: string): boolean {
    return this.expandedMenus().has(path);
  }

  onItemHover(path: string | null) {
    this.hoveredItem.set(path);
  }

  isActive(path: string): boolean {
    return this.router.url === path || this.router.url.startsWith(path + '/');
  }

  hasActiveChild(item: NavItem): boolean {
    if (!item.children) return false;
    return item.children.some(c => this.isActive(c.path));
  }

  trackByPath(_: number, item: NavItem) {
    return item.path;
  }



private cargarContadores() {
  this.cargandoCount.set(true);

  // 1️⃣ Obtengo el rol
  const rol = this.rolUsuario();

  // 2️⃣ Si soy administrador (4) → traigo todos los tickets
  if (rol === 4) {
    const sub = this.ticketService.getAllTickets().subscribe({
      next: (tickets: Ticket[]) => {
        this.ticketsAbiertosCount.set(tickets.length);
        this.cargandoCount.set(false);
      },
      error: (err) => {
        this.errorCount.set('No se pudo cargar tickets');
        this.cargandoCount.set(false);
      }
    });
    this.subscriptions.add(sub);
  }

  // 3️⃣ Si soy técnico (2) → traigo solo los tickets asignados a ese usuario
  if (rol === 2) {
  const usuarioId = this.authService.getUsuarioId(); // 👈 ya devuelve number
  const sub = this.ticketService.getTicketsAsignadosA(usuarioId).subscribe({
    next: (tickets: Ticket[]) => {
      this.ticketsEnProcesoByTecCount.set(tickets.length);
      this.cargandoCount.set(false);
    },
    error: (err) => {
      this.errorCount.set('No se pudo cargar tickets asignados');
      this.cargandoCount.set(false);
    }
  });
  this.subscriptions.add(sub);
}
}




}