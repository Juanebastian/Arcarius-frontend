import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../core/services/user.service';
import { Usuario, UsuarioCreate, UsuarioUpdate } from '../../../core/models/user.model';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-usuarios-list',               // Nombre del componente en HTML (<app-usuarios-list>)
  standalone: true,                            // Permite usar el componente sin necesidad de declararlo en un módulo
  imports: [CommonModule, FormsModule, HttpClientModule], // Módulos necesarios (formularios, http, etc.)
  templateUrl: './usuarios-list.component.html',
  styleUrls: ['./usuarios-list.component.css']
})
export class UsuariosListComponent implements OnInit {

  // 🔹 Variables principales
  usuarios: Usuario[] = [];              // Lista completa de usuarios obtenida del backend
  usuariosFiltrados: Usuario[] = [];     // Lista filtrada según búsqueda/rol
  usuariosPagina: Usuario[] = [];        // Lista que se muestra en pantalla según la paginación

  // 🔹 Definición de roles (se podría traer también desde backend)
  roles: { id: number, nombre: string }[] = [
    { id: 1, nombre: 'Ciudadano' },
    { id: 2, nombre: 'Funcionario' },
    { id: 3, nombre: 'Auditor' },
    { id: 4, nombre: 'Administrador' }
  ];

  // 🔹 Estados de UI
  cargando = false;                      // True mientras carga datos
  error: string | null = null;           // Mensaje de error si falla algo
  mostrarFormulario = false;             // Muestra/oculta el formulario de creación/edición
  usuarioEditando: Usuario | null = null;// Usuario que se está editando (null si es creación)

  // 🔹 Objeto temporal para crear/editar usuario
  nuevoUsuario: any = {};

  // 🔹 Variables de filtro y paginación
  filtroTexto = '';                      // Texto escrito en el buscador
  paginaActual = 1;                      // Página actual en la tabla
  itemsPorPagina = 5;                    // Número de usuarios por página
  totalPaginas = 1;                      // Total de páginas calculadas

  constructor(private userService: UserService) {}

  ngOnInit() {
    this.cargarUsuarios();               // Al iniciar el componente, se cargan los usuarios
  }

  // ===============================
  // 🔹 Cargar lista de usuarios desde el backend
  // ===============================
  cargarUsuarios() {
    this.cargando = true;
    this.error = null;

    this.userService.getAllUsers().subscribe({
      next: (data) => {
        this.usuarios = data;            // Guardar usuarios
        this.aplicarFiltro();            // Aplicar filtro inicial
        this.cargando = false;
      },
      error: () => {
        this.error = 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  // ===============================
  // 🔹 Abrir formulario en modo creación
  // ===============================
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.usuarioEditando = null;         // No estamos editando, es nuevo
    this.nuevoUsuario = this.usuarioVacio();
  }

  // Cerrar formulario
  cerrarFormulario() {
    this.mostrarFormulario = false;
    this.usuarioEditando = null;
  }

  // ===============================
  // 🔹 Retorna un usuario vacío (para crear uno nuevo)
  // ===============================
  usuarioVacio() {
    return {
      documento: '',
      nombre_completo: '',
      email: '',
      contrasena: '',        // ⚠️ Solo usado en frontend, luego se mapea a password_hash
      rol_id: 1,
      telefono: undefined,
      activo: true
    };
  }

  // ===============================
  // 🔹 Guardar usuario (crear o editar según corresponda)
  // ===============================
  guardarUsuario() {
    if (this.usuarioEditando) {
      // --- Modo edición ---
      const usuarioUpdate: UsuarioUpdate = { 
        documento: this.nuevoUsuario.documento,
        nombre_completo: this.nuevoUsuario.nombre_completo,
        email: this.nuevoUsuario.email,
        rol_id: this.nuevoUsuario.rol_id,
        telefono: this.nuevoUsuario.telefono,
        activo: this.nuevoUsuario.activo,
        ...(this.nuevoUsuario.contrasena ? { password_hash: this.nuevoUsuario.contrasena } : {})
      };

      this.userService.updateUser(this.usuarioEditando.id, usuarioUpdate).subscribe({
        next: () => {
          this.cargarUsuarios();         // Refrescar lista
          this.cerrarFormulario();
        },
        error: () => {
          this.error = 'Error al actualizar el usuario';
        }
      });

    } else {
      // --- Modo creación ---
      const usuarioCreate: UsuarioCreate = {
        documento: this.nuevoUsuario.documento,
        nombre_completo: this.nuevoUsuario.nombre_completo,
        email: this.nuevoUsuario.email,
        password_hash: this.nuevoUsuario.contrasena,
        rol_id: this.nuevoUsuario.rol_id,
        telefono: this.nuevoUsuario.telefono,
        activo: this.nuevoUsuario.activo
      };

      this.userService.createUser(usuarioCreate).subscribe({
        next: () => {
          this.cargarUsuarios();         // Refrescar lista
          this.cerrarFormulario();
        },
        error: () => {
          this.error = 'Error al crear el usuario';
        }
      });
    }
  }

  // ===============================
  // 🔹 Abrir formulario en modo edición
  // ===============================
  editarUsuario(usuario: Usuario) {
    this.usuarioEditando = usuario;
    this.nuevoUsuario = {
      documento: usuario.documento,
      nombre_completo: usuario.nombre_completo,
      email: usuario.email,
      contrasena: '', // ⚠️ nunca se muestra la real
      rol_id: usuario.rol_id,
      telefono: usuario.telefono,
      activo: usuario.activo
    };
    this.mostrarFormulario = true;
  }

  // ===============================
  // 🔹 Obtener nombre de rol por ID
  // ===============================
  getNombreRol(rolId: number): string {
    const rol = this.roles.find(r => Number(r.id) === Number(rolId));
    return rol ? rol.nombre : 'Sin rol';
  }

  // ===============================
  // 🔹 Filtro por rol
  // ===============================
  rolSeleccionado: number | null = null; // null = todos los roles
  rolesSeleccionados: number[] = []
  filtrarPorRol(rolId: number | null) {
    this.rolSeleccionado = rolId;
    this.aplicarFiltro();
  }

  // ===============================
  // 🔹 Aplicar filtro (texto + rol)
  // ===============================
aplicarFiltro() {
  this.usuariosFiltrados = this.usuarios.filter(u => {
    // Filtrado por texto
    const coincideTexto =
      u.nombre_completo.toLowerCase().includes(this.filtroTexto.toLowerCase()) ||
      u.documento.includes(this.filtroTexto) ||
      u.email.toLowerCase().includes(this.filtroTexto.toLowerCase());

    // Filtrado por múltiples roles
    const coincideRol =
      this.rolesSeleccionados.length > 0
        ? this.rolesSeleccionados.includes(Number(u.rol_id))
        : true; // Si no hay roles seleccionados, mostrar todos

    return coincideTexto && coincideRol;
  });

  // Calcular páginas
  this.totalPaginas = Math.ceil(this.usuariosFiltrados.length / this.itemsPorPagina) || 1;
  this.cambiarPagina(1);
}



onCheckboxChange(event: any, rolId: number) {
  if (event.target.checked) {
    this.rolesSeleccionados.push(rolId);
  } else {
    this.rolesSeleccionados = this.rolesSeleccionados.filter(id => id !== rolId);
  }
  this.aplicarFiltro();
}




  // Se ejecuta al escribir en el buscador
  onFiltroChange() {
    this.aplicarFiltro();
  }

  // ===============================
  // 🔹 Paginación
  // ===============================
  cambiarPagina(pagina: number) {
    if (pagina < 1 || pagina > this.totalPaginas) return;
    this.paginaActual = pagina;

    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;

    // Se muestran solo los usuarios filtrados en la página actual
    this.usuariosPagina = this.usuariosFiltrados.slice(inicio, fin);
  }
}
