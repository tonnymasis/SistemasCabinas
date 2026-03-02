# 💾 Sistema de Backups Avanzado - Guía de Usuario

## 🎯 Resumen del Sistema Implementado

### **Estado Actual ANTES vs DESPUÉS**

| **ANTES** | **DESPUÉS** |
|-----------|-------------|
| ❌ Backups infinitos acumulándose | ✅ Limpieza automática inteligente |
| ❌ Solo backup en cada cambio | ✅ Sistema de 4 niveles de backup |
| ❌ Sin gestión desde interfaz | ✅ Panel web completo |
| ❌ Sin programación | ✅ Backups programados |

---

## 🔄 **Frecuencias de Backup Implementadas**

### **1. ⚡ Backup Transaccional (Automático)**
- **Cuándo:** Cada vez que crear/editas/eliminas una reserva
- **Retención:** Últimos 50 archivos (aprox. 24-48 horas)
- **Formato:** `data.backup-2026-03-02T05-09-36-190Z.json`
- **Propósito:** Recuperación inmediata de errores

### **2. 📅 Backup Diario (Manual/Programado)**  
- **Cuándo:** 1 vez por día (ideal: 2:00 AM)
- **Retención:** 30 días
- **Formato:** `data.daily-2026-03-02-02-00-00.json`
- **Propósito:** Punto de restauración diario confiable

### **3. 📊 Backup Semanal (Manual/Programado)**
- **Cuándo:** 1 vez por semana (ideal: domingos)
- **Retención:** 12 semanas (3 meses)
- **Formato:** `data.weekly-2026-03-02-02-00-00.json`
- **Propósito:** Archivo de mediano plazo

### **4. 📆 Backup Mensual (Manual/Programado)**
- **Cuándo:** 1 vez por mes (ideal: día 1)
- **Retención:** 12 meses (1 año)  
- **Formato:** `data.monthly-2026-03-02-02-00-00.json`
- **Propósito:** Archivo histórico de largo plazo

---

## 📋 **Recomendaciones de Frecuencia**

### **🏨 Para Negocio de Cabañas (Tu Caso):**

```bash
✅ AUTOMATICOS (Ya funcionando):
   • Backup transaccional: Cada reserva (✓ Implementado)
   • Limpieza automática: Mantiene últimos 50 (✓ Implementado)

✅ MANUALES RECOMENDADOS:
   • Backup diario: Cada noche antes de cerrar
   • Backup semanal: Domingo en la noche  
   • Backup mensual: Al finalizar cada mes

⚠️ CRITICOS:
   • Antes de temporada alta (Navidad, Semana Santa)
   • Antes de actualizaciones del sistema
   • Después de importar datos grandes
```

### **🎯 Escenarios de Backup Extra:**

| **Situación** | **Tipo de Backup** | **Cuándo Crearlo** |
|---------------|-------------------|-------------------|
| Fin de año fiscal | Mensual | 31 de diciembre |
| Antes de cambios grandes | Manual | Justo antes |
| Importar reservas masivas | Diario | Antes y después |  
| Mantenimiento del servidor | Semanal | Antes del trabajo |
| Auditorías | Mensual | Según requerimientos |

---

## 🚀 **Cómo Usar el Sistema Web**

### **Acceso al Panel:**
1. Dashboard → "Herramientas de Administración" 
2. Click en "💾 Sistema de Backups"
3. URL directa: `/reports/backups`

### **Crear Backup Manual:**
```
1. Selecciona tipo: Diario/Semanal/Mensual
2. Click en el botón correspondiente  
3. Espera confirmación "Backup creado exitosamente"
4. El archivo aparece en la tabla inferior
```

### **Restaurar Backup:**
```
⚠️ PRECAUCIÓN: Esta acción no se puede deshacer

1. Localiza el backup en la tabla
2. Click en "Restaurar" en la fila correspondiente
3. Confirma en el diálogo de advertencia
4. Espera confirmación y recarga la página
```

---

## 📊 **Monitoreo del Sistema**

El panel te muestra:
- **Total de backups** por tipo
- **Tamaño de archivos** para control de espacio
- **Fechas exactas** de creación
- **Estado de limpieza** automática

### **Señales de Alerta:**
- 🔴 **Sin backups diarios:** Crear uno inmediatamente
- 🟡 **Muchos transaccionales:** Normal si hay alta actividad
- 🟢 **Balance entre tipos:** Sistema funcionando bien

---

## 💡 **Tips de Mejores Prácticas**

### **✅ DO (Hacer):**
- Crear backup diario antes de cerrar operaciones
- Verificar que los backups se están creando
- Mantener backups mensuales para auditorías
- Probar restauración periódicamente

### **❌ DON'T (No hacer):**  
- Depender solo de backups transaccionales
- Restaurar sin backup de respaldo
- Ignorar el panel de backups por semanas
- Eliminar backups manualmente de la carpeta

---

## 🔧 **Configuración Avanzada (Opcional)**

Si quieres automatizar backups programados, puedes configurar:

### **Windows Task Scheduler:**
```bash
# Crear backup diario a las 2:00 AM
Acción: curl -X POST http://localhost:3000/api/backups 
        -H "Content-Type: application/json" 
        -d '{"action":"create","type":"daily"}'
```

### **Cron Job (Linux/Mac):**
```bash
# Backup diario a las 2:00 AM
0 2 * * * curl -X POST http://localhost:3000/api/backups -H "Content-Type: application/json" -d '{"action":"create","type":"daily"}'

# Backup semanal domingo a las 3:00 AM  
0 3 * * 0 curl -X POST http://localhost:3000/api/backups -H "Content-Type: application/json" -d '{"action":"create","type":"weekly"}'

# Backup mensual día 1 a las 4:00 AM
0 4 1 * * curl -X POST http://localhost:3000/api/backups -H "Content-Type: application/json" -d '{"action":"create","type":"monthly"}'
```

---

## 🎉 **Sistema Completo Implementado**

✅ **Backup automático** en tiempo real  
✅ **Limpieza inteligente** de archivos antiguos  
✅ **4 niveles de backup** (transaccional, diario, semanal, mensual)  
✅ **Panel web completo** para gestión visual  
✅ **API REST** para automatización  
✅ **Restauración segura** con confirmaciones  
✅ **Retención optimizada** por tipo de backup  

**Tu sistema de backups ahora es de nivel empresarial** 🚀