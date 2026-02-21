# Trazea

<div align="center">

<img src="./public/trazea-icon.svg" alt="Trazea Logo" width="200">

**Sistema de Gestión de Taller e Inventario**

Aplicación web moderna para la gestión integral de inventarios, repuestos, garantías y movimientos de stock.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.1.17-06B6D4.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[![FSD](https://img.shields.io/badge/Architecture-Feature--Sliced%20Design-7B3FF2)](https://feature-sliced.design/)

</div>

---

## 📋 Tabla de Contenidos

- [📖 Descripción](#-descripción)
- [🏗️ Arquitectura](#️-arquitectura)
- [✨ Características](#-características)
- [🚀 Tecnologías](#-tecnologías)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [⚙️ Configuración](#️-configuración)
- [🔧 Instalación y Ejecución](#-instalación-y-ejecución)
- [🐳 Docker](#-docker)
- [📚 Desarrollo](#-desarrollo)
- [🧪 Testing](#-testing)
- [🚀 Despliegue](#-despliegue)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

---

## 📖 Descripción

**Trazea (W.M.S.)** es una aplicación web profesional diseñada para la gestión completa de inventarios, repuestos y garantías. Desarrollada con las mejores prácticas de desarrollo moderno, esta plataforma permite a las organizaciones controlar sus activos, gestionar solicitudes de repuestos, realizar conteos de inventario y mantener un registro detallado de movimientos y garantías de productos.

La aplicación implementa una arquitectura escalable basada en **Feature-Sliced Design (FSD)**, lo que garantiza un código mantenible, modular y fácil de extender.

### Propósito Principal

- Gestión centralizada de inventarios multi-ubicación
- Control de repuestos y solicitudes de taller
- Administración de garantías y movimientos de stock
- Sistema de conteo físico con generación de reportes
- Gestión de usuarios con roles y permisos diferenciados

---

## 🏗️ Arquitectura

### Feature-Sliced Design (FSD)

Este proyecto implementa la metodología **Feature-Sliced Design**, una arquitectura que organiza el código en capas lógicas y reutilizables:

```
src/
├── app/          # Configuración global y providers
├── entities/     # Lógica de negocio del dominio
├── features/     # Funcionalidades específicas del usuario
├── pages/        # Composición de features en pantallas
├── widgets/      # Componentes UI reutilizables
├── shared/       # Código compartido entre capas
└── processes/    # Flujo de datos entre features
```

#### Capas de la Arquitectura

1. **app/** - Configuración global, routing, providers
2. **entities/** - Entidades de negocio (User, Inventory, Locations)
3. **features/** - Casos de uso específicos (CreateSpare, RequestSpares)
4. **pages/** - Composición de features en vistas completas
5. **widgets/** - Componentes UI reutilizables (Pagination, Notifications)
6. **shared/** - Utilidades, UI components, tipos comunes

#### Principios Clave

- **Separación de responsabilidades**: Cada capa tiene un propósito definido
- **Reutilización**: Los widgets y entities pueden ser usados en múltiples features
- **Mantenibilidad**: La arquitectura facilita la localización y modificación de código
- **Escalabilidad**: Nueva funcionalidad puede agregarse sin afectar el código existente

---

## ✨ Características

### 🏪 Gestión de Inventario
- **Control Multi-ubicación**: Gestiona inventarios en diferentes sedes
- **Movimientos de Stock**: Registro detallado de entradas y salidas
- **Historial Completo**: Trazabilidad de cada movimiento con referencia
- **Imágenes de Productos**: Soporte para carga y visualización de imágenes

### 🔩 Gestión de Repuestos
- **Catálogo Centralizado**: Base de datos completa de repuestos
- **Solicitudes de Taller**: Workflow de aprobación para solicitudes
- **Filtros Avanzados**: Búsqueda por código, descripción, categoría
- **Carga Masiva**: Importación de repuestos desde archivos Excel

### 🛡️ Sistema de Garantías
- **Creación de Garantías**: Registro de productos con garantía
- **Seguimiento**: Estado actual de cada garantía
- **Integración con Inventario**: Vinculación automática con productos

### 📊 Conteo Físico
- **Conteo por Categorías**: Proceso organizado por grupos de productos
- **Validación en Tiempo Real**: Comparación con stock actual
- **Reporte de Diferencias**: Identificación automática de discrepancias
- **Exportación de Resultados**: Generación de reportes en Excel

### 👥 Gestión de Usuarios
- **Autenticación Segura**: Integración con Supabase Auth
- **Roles y Permisos**: Admin, Técnico, Supervisor
- **Selección de Ubicación**: Restricción por sede asignada

### 🔔 Notificaciones
- **Sistema de Alertas**: Notificaciones en tiempo real
- **Notificaciones WhatsApp**: Integración para solicitudes críticas
- **Menú Centralizado**: Gestión unificada de todas las notificaciones

---

## 🚀 Tecnologías

### Frontend Core
- **React 19.2.0** - Biblioteca principal de UI
- **TypeScript 5.9.3** - Tipado estático y mejor desarrollo
- **Vite 7.2.2** - Build tool ultrarrápido con HMR
- **React Router DOM 7.9.6** - Gestión de rutas

### UI Framework & Styling
- **Tailwind CSS 4.1.17** - Framework de CSS utility-first
- **Radix UI** - Componentes accesibles y desacoplados
- **Lucide React** - Biblioteca de iconos modernos
- **Sonner** - Sistema de toast notifications

### State Management & Data Fetching
- **Zustand 5.0.8** - Gestión de estado ligera
- **TanStack Query 5.90.10** - Server state management y cache
- **React Hook Form 7.66.1** - Forms con validación
- **Zod 4.1.13** - Validación de esquemas

### Backend & Database
- **Supabase** - Backend-as-a-Service (Authentication, Database, Storage)
- **PostgreSQL** - Base de datos principal (manejada por Supabase)

### Development & Testing
- **ESLint** - Linting y calidad de código
- **Vitest** - Testing framework integrado
- **Testing Library** - Testing de componentes React
- **TypeScript ESLint** - Reglas específicas para TypeScript

### Production & Monitoring
- **Sentry 10.26.0** - Error tracking y monitoring
- **PWA** - Progressive Web App capabilities
- **Docker** - Contenerización para producción

---

## 📁 Estructura del Proyecto

```
minca-inventory-system/
├── 📁 public/                 # Assets estáticos
│   ├── Trazea-icon.svg        # Logo principal
│   └── logo_min.png          # Logo versión miniatura
├── 📁 src/                   # Código fuente
│   ├── 📁 app/               # Configuración global
│   │   ├── ui/              # App principal y routing
│   │   ├── providers/       # React providers
│   │   ├── styles/          # Estilos globales
│   │   └── lib/             # Utilidades de la app
│   ├── 📁 entities/         # Entidades de negocio
│   │   ├── user/            # Lógica de usuarios
│   │   ├── locations/       # Gestión de ubicaciones
│   │   └── inventory/       # Entidades de inventario
│   ├── 📁 features/         # Funcionalidades específicas
│   │   ├── auth-login/      # Login de usuarios
│   │   ├── spares-create/   # Creación de repuestos
│   │   ├── spares-upload/   # Carga masiva
│   │   ├── spares-request-workshop/ # Solicitudes taller
│   │   ├── guarantees-create/ # Gestión garantías
│   │   └── count-spares/    # Conteo físico
│   ├── 📁 pages/            # Vistas completas
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── inventario/     # Gestión de inventario
│   │   ├── spares/         # Gestión de repuestos
│   │   ├── orders/         # Órdenes de trabajo
│   │   ├── records/        # Registros y garantías
│   │   ├── count/          # Conteo físico
│   │   └── dynamo/         # Página especial Dynamo
│   ├── 📁 widgets/          # Componentes reutilizables
│   │   ├── nav/            # Navegación principal
│   │   ├── notifications/  # Sistema de notificaciones
│   │   └── pagination/     # Paginación genérica
│   ├── 📁 shared/           # Código compartido
│   │   ├── ui/             # Componentes UI base
│   │   ├── lib/            # Utilidades y helpers
│   │   └── components/     # Componentes comunes
│   ├── 📁 assets/           # Imágenes y recursos
│   └── 📄 main.tsx         # Punto de entrada
├── 📁 dist/                 # Build de producción
├── 📄 package.json          # Dependencias y scripts
├── 📄 vite.config.ts        # Configuración de Vite
├── 📄 tsconfig.json         # Configuración TypeScript
├── 📄 docker-compose.yml    # Configuración Docker
├── 📄 Dockerfile            # Imagen Docker
├── 📄 .env.example          # Variables de entorno ejemplo
└── 📄 README.md             # Documentación
```

---

## ⚙️ Configuración

### Variables de Entorno

Crea un archivo `.env` basado en `.env.example`:

```env
# Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Supabase Setup

1. **Crea un proyecto en Supabase**
2. **Configura Authentication**: Habilita email/password auth
3. **Crea las tablas necesarias**:
   - `users` (usuarios y roles)
   - `locations` (sedes/ubicaciones)
   - `inventory` (productos y stock)
   - `spares` (repuestos)
   - `guarantees` (garantías)
   - `movements` (movimientos de stock)
   - `requests` (solicitudes)

4. **Configura Row Level Security (RLS)** para cada tabla
5. **Agrega storage buckets** para imágenes de productos

---

## 🔧 Instalación y Ejecución

### Requisitos Previos

- **Node.js** 22 o superior
- **pnpm** (recomendado) o npm
- **Git**

### Instalación

```bash
# Clona el repositorio
git clone <repository-url>
cd minca-inventory-system

# Instala dependencias
pnpm install

# Configura variables de entorno
cp .env.example .env
# Edit .env con tus credenciales
```

### Scripts Disponibles

```bash
# Desarrollo con HMR
pnpm dev

# Build para producción
pnpm build

# Preview del build
pnpm preview

# Linting del código
pnpm lint

# Type checking
pnpm tsc --noEmit
```

### Ejecución

```bash
# Modo desarrollo (http://localhost:5173)
pnpm dev

# Modo producción
pnpm build && pnpm preview
```

---

## 🐳 Docker

### Desarrollo con Docker

```bash
# Construye y ejecuta el contenedor
docker-compose up --build

# Ejecución en segundo plano
docker-compose up -d --build

# Detener contenedores
docker-compose down
```

### Producción con Docker

```bash
# Construye imagen de producción
docker build -t minca-inventory:latest .

# Ejecuta contenedor de producción
docker run -p 80:80 minca-inventory:latest
```

---

## 📚 Desarrollo

### Convenciones de Código

- **TypeScript estricto**: Todo el código debe estar tipado
- **ESLint**: Configuración para mantener calidad de código
- **Componentes funcionales**: Usar hooks y functional components
- **Tailwind CSS**: Prefiere utility classes sobre CSS custom

### Flujo de Trabajo FSD

Al agregar nueva funcionalidad:

1. **Identifica la capa correcta**:
   - ¿Es una entidad del dominio? → `entities/`
   - ¿Es un caso de uso completo? → `features/`
   - ¿Es un componente reutilizable? → `widgets/`
   - ¿Es una vista completa? → `pages/`

2. **Estructura de un feature**:
   ```
   features/nombre-feature/
   ├── ui/           # Componentes de UI
   ├── model/        # Tipos y validaciones
   ├── lib/          # Lógica de negocio
   ├── api/          # Llamadas a API
   └── index.ts      # Exportaciones públicas
   ```

3. **Exports públicos**: Cada segmento debe tener un `index.ts`

### Branching Strategy

- `main`: Rama de producción
- `develop`: Rama de desarrollo
- `feature/nombre`: Features específicos
- `hotfix/nombre**: Correcciones urgentes

### Commit Convention

```bash
feat: nueva funcionalidad
fix: corrección de bug
docs: documentación
style: formato/código
refactor: refactorización
test: pruebas
chore: dependencias/configuración
```

---

## 🧪 Testing

### Testing Setup

El proyecto utiliza **Vitest** y **Testing Library**:

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar en modo watch
pnpm test:watch

# Cobertura de código
pnpm test:coverage
```

### Estructura de Tests

- **Unit Tests**: Lógica de negocio, hooks, utilities
- **Component Tests**: Componentes React aislados
- **Integration Tests**: Flujo completo de features

---

## 🚀 Despliegue

### Vercel (Recomendado)

1. **Conecta tu repo a Vercel**
2. **Configura variables de entorno** en Vercel
3. **Deploy automático** en cada push a `main`

### Despliegue Manual

```bash
# Build de producción
pnpm build

# Deploy a servidor
scp -r dist/* user@server:/path/to/app/
```

### Configuración de Producción

- **Environment Variables**: Todas las variables deben estar configuradas
- **HTTPS**: Habilitar SSL en producción
- **CORS**: Configurar orígenes permitidos en Supabase
- **Monitoring**: Sentry ya está configurado para error tracking

---

## 🤝 Contribución

### Cómo Contribuir

1. **Fork el proyecto**
2. **Crea una rama**: `git checkout -b feature/tu-feature`
3. **Commits descriptivos**: `git commit -m 'feat: agregar nueva funcionalidad'`
4. **Push a tu fork**: `git push origin feature/tu-feature`
5. **Pull Request**: Detalla los cambios realizados

### Guía de Pull Requests

- **Título descriptivo**: Resumen del cambio
- **Descripción detallada**: Contexto y motivación
- **Screenshots**: Si aplica, muestra before/after
- **Tests**: Incluye tests para nueva funcionalidad
- **Documentación**: Actualiza README si es necesario

### Código de Conducta

- **Respeto**: Trata a todos con respeto
- **Constructivo**: Feedback constructivo y positivo
- **Inclusivo**: Fomenta un ambiente inclusivo
- **Profesional**: Mantén comunicación profesional

---

## 📄 Licencia

Este proyecto está licenciado bajo la **MIT License**.

```
MIT License

Copyright (c) 2024 Oscar Casas

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 📞 Soporte

Para soporte técnico o preguntas:

- **Email**: oscar.casas@example.com
- **Issues**: [GitHub Issues](https://github.com/tu-usuario/minca-inventory-system/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/minca-inventory-system/discussions)

---

<div align="center">

**Desarrollado con ❤️ por Oscar Casas**

[![Made with React](https://img.shields.io/badge/Made%20with-React-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Feature-Sliced Design](https://img.shields.io/badge/Architecture-FSD-purple?style=for-the-badge)](https://feature-sliced.design/)

</div>