# Arcarius — Frontend

Frontend del sistema **Arcarius**, una plataforma de gestión administrativa que cubre proyectos, gastos, tickets de soporte, denuncias, auditorías y administración de usuarios, con dashboards diferenciados por rol.

Construido con **Angular 19**, **Tailwind CSS 4**, **Angular Material** y **Chart.js**.

---

## Stack

- **Framework:** Angular 19.2 (standalone components + lazy loading)
- **UI:** Angular Material 19 + Angular CDK
- **Estilos:** Tailwind CSS 4 (vía PostCSS)
- **Iconos:** Lucide Angular
- **Gráficas:** Chart.js + ng2-charts
- **Auth:** JWT (`jwt-decode`) con `AuthGuard`
- **HTTP:** RxJS + `HttpClient` de Angular
- **Tests:** Karma + Jasmine
- **Lenguaje:** TypeScript 5.7

---

## Requisitos previos

- **Node.js** 18.19+ o 20.11+ (recomendado por Angular 19)
- **npm** 10+
- **Angular CLI 19** (opcional, ya viene como devDependency):
  ```bash
  npm install -g @angular/cli@19
  ```
- **Backend** Arcarius corriendo en `http://localhost:3000` (ver `src/environments/environment.component.ts`)

---

## Instalación

```bash
git clone https://github.com/Juanebastian/Arcarius-frontend.git
cd Arcarius-frontend
npm install
```

---

## Configuración del entorno

La URL del backend se define en [src/environments/environment.component.ts](src/environments/environment.component.ts):

```ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Si tu backend corre en otro puerto u host, ajústalo aquí antes de levantar la app.

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm start` | Levanta el dev server en `http://localhost:4200/` |
| `npm run build` | Build de producción en `dist/` |
| `npm run watch` | Build incremental en modo desarrollo |
| `npm test` | Tests unitarios con Karma + Jasmine |

Para correr la app:

```bash
npm start
```

---

## Estructura del proyecto

```
src/
├── app/
│   ├── core/                  # Lógica transversal
│   │   ├── models/            # Interfaces y tipos del dominio
│   │   └── services/          # Servicios HTTP (auth, proyectos, gastos, etc.)
│   ├── layouts/               # Header, Sidebar, Footer
│   └── modules/               # Funcionalidades por dominio
│       ├── auth/              # Login + AuthGuard
│       ├── dashboard/         # Dashboards (admin / funcionario)
│       ├── proyectos/         # Gestión de proyectos
│       ├── gastos/            # Gestión de gastos
│       ├── soporte/           # Tickets de soporte
│       ├── denuncias/         # Denuncias
│       ├── auditoria/         # Auditorías
│       └── usuarios/          # Layouts y vistas por rol
│           ├── admin/
│           ├── auditores/
│           └── funcionarios/
├── environments/              # Configuración por entorno
└── styles.css                 # Estilos globales (Tailwind)
```

---

## Roles y rutas principales

El acceso a los módulos está protegido por [AuthGuard](src/app/modules/auth/auth.guard.ts) (validación de JWT).

| Ruta | Rol | Descripción |
|---|---|---|
| `/login` | público | Autenticación |
| `/administrador` | admin | Panel completo (usuarios, auditorías, todos los módulos) |
| `/funcionarios` | funcionario | Vista limitada a sus propios proyectos, gastos y tickets |

Las rutas se cargan con **lazy loading** desde [src/app/app.routes.ts](src/app/app.routes.ts).

---

## Módulos funcionales

- **Autenticación** — Login con JWT, guardado en `localStorage`, decodificación de token para extraer rol.
- **Dashboard** — Vistas diferenciadas para admin y funcionario, con métricas y gráficas (Chart.js).
- **Proyectos** — CRUD de proyectos y documentos asociados.
- **Gastos** — Registro y aprobación de gastos.
- **Soporte** — Tickets con estado y asignación.
- **Denuncias** — Canal de denuncias.
- **Auditoría** — Registro de auditorías administrativas.
- **Usuarios** — Administración de cuentas (solo admin).

---

## Build de producción

```bash
npm run build
```

Los artefactos se generan en `dist/`. La build de producción aplica AOT, tree-shaking y optimizaciones de Angular CLI.

---

## Tests

```bash
npm test
```

Ejecuta la suite con Karma + Jasmine en modo watch.

---

## Convenciones

- **Componentes standalone** (Angular 19) — sin `NgModule` por feature.
- **Servicios** centralizados en `core/services/` — un servicio por entidad.
- **Modelos** en `core/models/` — interfaces TypeScript del dominio.
- **Lazy loading** por rol vía `loadChildren` en `app.routes.ts`.

---

## Repositorio

[github.com/Juanebastian/Arcarius-frontend](https://github.com/Juanebastian/Arcarius-frontend)
