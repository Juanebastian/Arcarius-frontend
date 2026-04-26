import { Routes } from '@angular/router';
import { FuncionarioLayoutComponent } from './funcionario-layout.component';
import { FuncionarioDashboardComponent } from '../../../dashboard/funcionario-dashboard/funcionario-dashboard.component';
import { FuncionarioTicketsListComponent } from '../../../soporte/funcionario-tickets-list/funcionario-tickets-list.component';
import { FuncionarioProyectosListComponent } from '../../../proyectos/funcionario-proyectos-list/funcionario-proyectos-list.component';
import { FuncionarioGastosListComponent } from '../../../gastos/funcionario-gastos-list/funcionario-gastos-list.component';




export default [
  {
    path: '',
    component: FuncionarioLayoutComponent,
    children: [
      { path: 'home', component: FuncionarioDashboardComponent },
      { path: 'listar-proyectos', component: FuncionarioProyectosListComponent },
      { path: 'listar-gastos', component: FuncionarioGastosListComponent },
      { path: 'listar-tickets', component: FuncionarioTicketsListComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  }
] satisfies Routes;




