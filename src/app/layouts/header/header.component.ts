import { Component, Output, EventEmitter, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service'; // 👈 Servicio de autenticación

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  /**
   * Evento que se emite cuando se hace clic en el botón del menú lateral.
   * Permite que el componente padre abra/cierre el sidebar.
   */
  @Output() toggleSidebar = new EventEmitter<void>();

  // ================== Signals ==================

  /** Controla si la barra de búsqueda está expandida o colapsada */
  readonly isSearchExpanded = signal(false);

  /** Número de notificaciones pendientes */
  readonly notificationCount = signal(3);

  /** Indica si el menú del usuario está abierto o cerrado */
  readonly userMenuOpen = signal(false);

  /** Nombre del usuario autenticado */
  userName = signal<string>('');  

  /** Email del usuario autenticado */
  userEmail = signal<string>('');  

  /** Rol del usuario autenticado */
  userRole = signal<string>('');  

  // ================== Inyección de dependencias ==================

  /** Servicio de autenticación (para obtener info del usuario y cerrar sesión) */
  private authService = inject(AuthService);

  // ================== Métodos públicos ==================

  /**
   * Emite el evento para alternar la visibilidad del sidebar.
   */
  toggle(): void {
    this.toggleSidebar.emit();
  }

  /**
   * Alterna el estado de la barra de búsqueda.
   */
  toggleSearch(): void {
    this.isSearchExpanded.update(value => !value);
  }

  /**
   * Alterna la visibilidad del menú del usuario.
   */
  toggleUserMenu(): void {
    this.userMenuOpen.update(value => !value);
  }

  /**
   * Hook de ciclo de vida de Angular.
   * Se ejecuta cuando se inicializa el componente.
   * Aquí se obtiene la información del usuario autenticado desde el servicio de autenticación.
   */
  ngOnInit(): void {
    const user = this.authService.getUserInfo(); // 👈 obtiene datos desde el token
    if (user) {
      this.userName.set(user.nombre || ''); 
      this.userEmail.set(user.email || '');
      this.userRole.set(user.rol || '');
    }
  }

  /**
   * Cierra la sesión del usuario autenticado.
   * Llama al método `logout` del servicio de autenticación.
   */
  cerrarSesion(): void {
    this.authService.logout();
  }

  // ================== Métodos pendientes ==================
  // Estos métodos se pueden implementar en el futuro para manejar más acciones en el header.

  /** Acción al buscar (pendiente de implementación) */
  onSearch($event: Event) {
    throw new Error('Method not implemented.');
  }

  /** Acción al hacer clic en el perfil del usuario (pendiente de implementación) */
  onProfileClick() {
    throw new Error('Method not implemented.');
  }

  /** Acción al hacer clic en notificaciones (pendiente de implementación) */
  onNotificationClick() {
    throw new Error('Method not implemented.');
  }

}
