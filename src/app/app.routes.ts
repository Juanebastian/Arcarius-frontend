import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login.component';
import { AuthGuard } from './modules/auth/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' }, 
    { path: 'login', component: LoginComponent },
    { path: 'administrador',
        canActivate: [AuthGuard],
        loadChildren: () => import('./modules/usuarios/admin/admin-layout/admin.routes') 
    },
    { path: 'funcionarios',
        canActivate: [AuthGuard],
        loadChildren: () => import('./modules/usuarios/funcionarios/funcionario-layout/funcionario.routes') 
    }
];
