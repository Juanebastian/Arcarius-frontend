import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './admin-layout.component';
import { AdminDashboardComponent } from '../../../dashboard/admin-dashboard/admin-dashboard.component';
import { UsuariosListComponent } from '../../usuarios-list/usuarios-list.component';
import { ProyectosListComponent } from '../../../proyectos/proyectos-list/proyectos-list.component';
import { GastosListComponent } from '../../../gastos/gastos-list/gastos-list.component';
import { TicketsListComponent } from '../../../soporte/tickets-list/tickets-list.component';
import { AdminAuditoriasComponent } from '../../../auditoria/admin-auditorias/admin-auditorias.component';
import { DenunciasListComponent } from '../../../denuncias/denuncias-list/denuncias-list.component';




export default [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'home', component: AdminDashboardComponent },
      { path: 'listar-usuarios', component: UsuariosListComponent },
      { path: 'listar-proyectos', component: ProyectosListComponent },
      { path: 'listar-gastos', component: GastosListComponent },
      { path: 'listar-tickets', component: TicketsListComponent },
      { path: 'denuncias', component: DenunciasListComponent },
      { path: 'auditorias', component: AdminAuditoriasComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
] satisfies Routes;

TicketsListComponent


