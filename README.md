# Sistema de Reservas de Cabañas - Cahuita

Sistema completo de gestión de reservas para cabañas en Cahuita, Costa Rica. Desarrollado con Next.js 16.1.6 y TypeScript.

## 🏡 Características Principales

- **Gestión de Reservas**: Sistema completo de creación, edición y visualización de reservas
- **Dashboard Dinámico**: Vista general con estadísticas en tiempo real
- **Calendario Interactivo**: Visualización de disponibilidad por cabañas
- **Sistema de Validación**: Validaciones completas con manejo de timezones
- **Reportes Avanzados**:
  - Reporte de Pagos (con alertas de urgencia)
  - Análisis de Ocupación Mensual
  - Disponibilidad Futura (90 días)
  - Gestión de Backups
- **Sistema de Backup Automático**: Respaldos programados con limpieza automática
- **Interfaz Responsive**: Diseño adaptable con Tailwind CSS

## 🚀 Tecnologías Utilizadas

- **Frontend**: Next.js 16.1.6, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Datos**: Sistema de archivos JSON con backup automático  
- **Validación**: Sistema custom de validaciones con timezone-awareness
- **Build**: Turbopack (modo desarrollo)

## 🏃‍♂️ Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/tonnymasis/SistemasCabinas.git
cd SistemasCabinas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar certificado SSL (para desarrollo)**
```bash
# Windows (PowerShell como administrador)
New-SelfSignedCertificate -DnsName localhost -CertStoreLocation cert:\\LocalMachine\\My -FriendlyName "Next.js Dev"
```

4. **Ejecutar en modo desarrollo**
```bash
npm run dev
```

5. **Abrir en el navegador**
```
https://localhost:3000
```

## 📊 Funcionalidades del Sistema

### Dashboard Principal
- Estado actual de cabañas disponibles
- Próximas reservas
- Estadísticas de ocupación

### Gestión de Reservas  
- Crear nueva reserva con validación completa
- Ver detalles de reserva por cabaña
- Editar reservas existentes

### Sistema de Reportes
- **Pagos**: Monitoreo de estado de pagos con alertas
- **Ocupación**: Análisis mensual de ocupación
- **Disponibilidad**: Calendario de 90 días con detalles
- **Backups**: Gestión completa de respaldos

## 🔧 Documentación

- `VALIDACIONES.md`: Sistema de validaciones
- `BACKUP-SYSTEM-GUIDE.md`: Guía del sistema de backups  
- `VALIDACIONES-FRONTEND.md`: Validaciones del frontend

---

**Desarrollado para Cabañas Cahuita, Costa Rica** 🇨🇷

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
