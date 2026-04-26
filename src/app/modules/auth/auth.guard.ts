import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const token = localStorage.getItem('auth_token');
    if (token) {
      return true; // puede entrar
    } else {
      // redirige al login en vez de dejar pantalla en blanco
      return this.router.parseUrl('/login');
    }
  }
}