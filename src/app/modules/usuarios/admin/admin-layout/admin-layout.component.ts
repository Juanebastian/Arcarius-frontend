import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarComponent } from "../../../../layouts/sidebar/sidebar.component";
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { AuthService } from '../../../../core/services/auth.service';
@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent
],
  templateUrl: './admin-layout.component.html',
  styleUrls: ['./admin-layout.component.css']
})
export class AdminLayoutComponent implements OnInit {
  sidebarCollapsed = false;

  private authService = inject(AuthService);
  
  constructor(
    
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserInfo();

    if (!user || user.rol !== 'administrador') {
      this.router.navigate(['/login']);
    }

  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
