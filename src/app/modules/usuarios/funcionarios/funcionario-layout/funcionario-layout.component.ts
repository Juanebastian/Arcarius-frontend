import { Component, inject, OnInit } from '@angular/core';
import { FooterComponent } from "../../../../layouts/footer/footer.component";
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from "../../../../layouts/header/header.component";
import { SidebarComponent } from "../../../../layouts/sidebar/sidebar.component";
import { AuthService } from '../../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-funcionario-layout',
  imports: [FooterComponent, RouterOutlet, HeaderComponent, SidebarComponent],
  templateUrl: './funcionario-layout.component.html',
  styleUrl: './funcionario-layout.component.css'
})
export class FuncionarioLayoutComponent implements OnInit {
  sidebarCollapsed = false;

  private authService = inject(AuthService);
  
  constructor(
    
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getUserInfo();

    if (!user || user.rol !== 'funcionario') {
      this.router.navigate(['/login']);
    }

  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }
}
