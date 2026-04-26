import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true, // 👈 Este componente es standalone (no requiere declararse en un módulo)
  imports: [
    ReactiveFormsModule, // Para manejar formularios reactivos
    CommonModule,        // Directivas básicas como *ngIf, *ngFor
    RouterModule         // Para navegación entre rutas
  ]
})
export class LoginComponent {
  // Formulario reactivo de login
  loginForm: FormGroup;

  // Flags de estado de la vista
  loading = false;   // Para mostrar spinner de carga mientras se procesa login
  errorMsg = '';     // Mensaje de error en caso de credenciales incorrectas u otro fallo

  constructor(
    private fb: FormBuilder,      // Para construir el formulario reactivo
    private authService: AuthService, // Servicio de autenticación
    private router: Router             // Para redirigir según el rol del usuario
  ) {
    // Definición de los campos del formulario
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]], // Campo email obligatorio y con formato válido
      password: ['', Validators.required]                  // Campo password obligatorio
    });
  }

  // Método que se ejecuta al enviar el formulario
  onSubmit() {
    // 🚨 Si el formulario es inválido, marcamos todos los campos como "tocados" para mostrar errores
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;  // Activamos spinner de carga
    this.errorMsg = '';   // Reiniciamos posibles mensajes de error anteriores

    // Extraemos valores del formulario
    const { email, password } = this.loginForm.value;

    // Llamamos al servicio de autenticación
    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.loading = false; // Desactivamos spinner

        // ✅ El backend devuelve el usuario dentro de `res.data.usuario`
        const user = res.data.usuario;

        // Redirigimos al usuario según su rol
        switch (user.rol.id) {
          case 1:
            this.router.navigate(['/ciudadanos']);   // Rol: Ciudadano
            break;
          case 2:
            this.router.navigate(['/funcionarios']); // Rol: Funcionario
            break;
          case 3:
            this.router.navigate(['/auditor']);      // Rol: Auditor
            break;
          case 4:
            this.router.navigate(['/administrador']); // Rol: Administrador
            break;
          default:
            this.errorMsg = 'Rol de usuario no reconocido.'; // 🚨 Caso inesperado
            break;
        }
      },
      error: (err) => {
        // 🚨 Capturamos error en login (ejemplo: credenciales incorrectas, servidor caído, etc.)
        console.error('Login error:', err);
        this.loading = false;
        this.errorMsg = err.message || 'Usuario o contraseña incorrectos.';
      }
    });
  }
}
