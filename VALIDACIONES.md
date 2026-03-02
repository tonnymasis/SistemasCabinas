# Sistema de Validaciones de Reservas

## ✅ Validaciones Implementadas

### 📅 **Validaciones de Fechas**
- ✅ Fecha de salida debe ser **posterior** a la fecha de entrada
- ✅ Las fechas **no pueden estar en el pasado**
- ✅ Debe haber **al menos 1 noche** de estadía
- ✅ Reservas máximo **365 días** de duración
- ✅ No permitir reservas con más de **2 años** de anticipación

### 👥 **Validaciones de Huéspedes**
- ✅ Número de huéspedes debe ser **mayor a 0**
- ✅ Máximo **50 huéspedes** por reserva
- ✅ No puede exceder la **capacidad de la cabaña**

### 💰 **Validaciones Financieras**
- ✅ Montos deben ser **números válidos** y positivos
- ✅ Depósito **no puede ser mayor** al monto total  
- ✅ Comisión **no puede ser mayor** al monto total
- ✅ Máximo **$1,000,000** por reserva

### 📝 **Validaciones de Datos**
- ✅ **Campos requeridos**: Cliente, teléfono, fechas, cabaña, canal
- ✅ **Formato de teléfono** válido (7-20 caracteres)
- ✅ **Longitud de texto** limitada (nombres, comentarios, etc.)
- ✅ **Moneda válida**: Solo USD o CRC

### 🏠 **Validaciones de Disponibilidad**
- ✅ Verificar que la **cabaña existe**
- ✅ **No solapamiento** de fechas con otras reservas
- ✅ Validar **capacidad de la cabaña**

## 📨 **Respuestas de Error Mejoradas**

### Antes:
```json
{
  "error": "Failed to create booking"
}
```

### Ahora:
```json
{
  "error": "Datos de reserva inválidos",
  "details": [
    "La fecha de salida debe ser posterior a la fecha de entrada",
    "El número de huéspedes debe ser mayor a 0",
    "El teléfono es requerido"
  ]
}
```

## 🧪 **Casos de Prueba**

### ❌ **Caso 1: Fechas Inválidas** (Problema Original)
```javascript
// ENTRADA: 11 de marzo 2026
// SALIDA: 10 de marzo 2026
// ❌ ERROR: "La fecha de salida debe ser posterior a la fecha de entrada"
```

### ❌ **Caso 2: Fechas en el Pasado**
```javascript
// ENTRADA: 1 de febrero 2026 (en el pasado)
// ❌ ERROR: "La fecha de entrada no puede estar en el pasado"
```

### ❌ **Caso 3: Exceso de Capacidad**
```javascript
// Cabaña para 4 personas, reserva para 6
// ❌ ERROR: "La capacidad máxima de esta cabaña es 4 personas"
```

### ❌ **Caso 4: Solapamiento de Fechas**
```javascript
// Misma cabaña ya reservada en esas fechas
// ❌ ERROR: "La cabaña ya está ocupada en las fechas seleccionadas"
```

### ✅ **Caso 5: Reserva Válida**
```javascript
{
  "cabinId": "cabin-1",
  "clientName": "Juan Pérez",
  "phone": "+506-8888-8888",
  "checkIn": "2026-03-15",
  "checkOut": "2026-03-18",
  "numberOfGuests": 2,
  "amount": 300,
  "currency": "USD"
  // ✅ ÉXITO: Reserva creada correctamente
}
```

## 🛠 **Archivos Modificados**

1. **`lib/domain/BookingService.ts`**
   - ✅ Validaciones completas con contexto
   - ✅ Verificación de disponibilidad mejorada

2. **`lib/utils/validation.ts`** (NUEVO)
   - ✅ Funciones utilitarias reutilizables
   - ✅ Validaciones de formato y tipos

3. **`app/api/bookings/route.ts`**
   - ✅ Validaciones en POST (crear)
   - ✅ Manejo mejorado de errores

4. **`app/api/bookings/[id]/route.ts`**
   - ✅ Validaciones en GET, PUT, DELETE
   - ✅ Verificación de existencia

## 🚀 **Próximos Pasos Recomendados**

1. **Frontend**: Agregar validaciones en tiempo real
2. **UX**: Mostrar errores de manera amigable
3. **Testing**: Crear tests automatizados
4. **Logs**: Implementar logging de errores
5. **Rate Limiting**: Protección contra spam