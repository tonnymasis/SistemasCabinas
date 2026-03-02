# Guía de Validaciones con Campos Específicos

## 📋 **Problemas Resueltos**

### ✅ **1. Validaciones en Creación Y Actualización**
- Las validaciones ahora se aplican tanto en **POST** (crear) como en **PUT** (actualizar)
- Ambos endpoints usan `validateBookingWithContext()` para consistencia

### ✅ **2. Campos Específicos para Errores** 
- Respuestas de error incluyen `fieldErrors` para identificar campos problemáticos
- Permite al frontend resaltar campos específicos con colores o bordes

### ✅ **3. Problema de Navegación del Calendario**
- Corregido el estado del mes/año en `app/page.tsx`
- Ahora las flechas ← → funcionan correctamente

## 🎨 **Respuestas de Error Mejoradas**

### **Antes:**
```json
{
  "error": "Datos inválidos"
}
```

### **Ahora:**
```json
{
  "error": "Datos de reserva inválidos",
  "fieldErrors": [
    {
      "field": "checkOut", 
      "message": "La fecha de salida debe ser posterior a la de entrada"
    },
    {
      "field": "numberOfGuests", 
      "message": "El número de huéspedes debe ser entre 1 y 50"
    },
    {
      "field": "phone", 
      "message": "El teléfono es requerido y debe tener un formato válido"
    }
  ],
  "details": [
    "La fecha de salida debe ser posterior a la de entrada",
    "El número de huéspedes debe ser entre 1 y 50", 
    "El teléfono es requerido y debe tener un formato válido"
  ]
}
```

## 💡 **Implementación Frontend (Ejemplo React)**

```jsx
// Manejo de errores con resaltado de campos
const [fieldErrors, setFieldErrors] = useState({});

const handleSubmit = async (data) => {
  try {
    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      
      // Convertir errores a objeto para fácil acceso
      const errors = {};
      errorData.fieldErrors?.forEach(err => {
        errors[err.field] = err.message;
      });
      setFieldErrors(errors);
      
      return;
    }
    
    // Éxito - limpiar errores
    setFieldErrors({});
    
  } catch (error) {
    console.error('Error:', error);
  }
};

// En el JSX - resaltar campos con error
<input 
  type="text"
  name="clientName"
  className={`form-input ${
    fieldErrors.clientName ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`}
  placeholder="Nombre del cliente"
/>
{fieldErrors.clientName && (
  <p className="text-red-500 text-sm mt-1">
    {fieldErrors.clientName}
  </p>
)}

<input 
  type="date"
  name="checkIn" 
  className={`form-input ${
    fieldErrors.checkIn ? 'border-red-500 bg-red-50' : 'border-gray-300'
  }`}
/>
{fieldErrors.checkIn && (
  <p className="text-red-500 text-sm mt-1">
    {fieldErrors.checkIn}
  </p>
)}
```

## 🎯 **Nombres de Campos Disponibles**

```typescript
// Campos que pueden tener errores específicos:
type FieldNames = 
  | 'clientName'      // Nombre del cliente
  | 'phone'           // Teléfono  
  | 'checkIn'         // Fecha de entrada
  | 'checkOut'        // Fecha de salida
  | 'numberOfGuests'  // Número de huéspedes
  | 'cabinId'         // ID de cabaña
  | 'reservationChannel' // Canal de reserva
  | 'amount'          // Monto total
  | 'deposit'         // Depósito
  | 'commission'      // Comisión
  | 'currency'        // Moneda (USD/CRC)
  | 'general'         // Errores generales del sistema
```

## 🧪 **Casos de Prueba**

### **Caso 1: Fechas Inválidas** ❌
```javascript
// POST /api/bookings
{
  "checkIn": "2026-03-11",
  "checkOut": "2026-03-10"  // ERROR: Anterior a entrada
}

// Respuesta:
{
  "fieldErrors": [
    {
      "field": "checkOut",
      "message": "La fecha de salida debe ser posterior a la de entrada"
    }
  ]
}
```

### **Caso 2: Múltiples Errores** ❌
```javascript
{
  "clientName": "",           // ERROR: Vacío
  "phone": "123",            // ERROR: Formato inválido  
  "numberOfGuests": 0,       // ERROR: Debe ser > 0
  "checkIn": "2026-02-01"    // ERROR: En el pasado
}

// Respuesta con 4 campos resaltados en rojo
```

### **Caso 3: Reserva Exitosa** ✅
```javascript
{
  "clientName": "Juan Pérez",
  "phone": "+506-8888-8888", 
  "checkIn": "2026-03-15",
  "checkOut": "2026-03-18",
  "numberOfGuests": 2,
  "cabinId": "cabin-1"
}
// ✅ Sin errores, campos en verde
```

## 🛠 **CSS de Ejemplo**

```css
/* Campo normal */
.form-input {
  @apply border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500;
}

/* Campo con error */
.form-input.error {
  @apply border-red-500 bg-red-50 focus:ring-red-500;
}

/* Mensaje de error */
.error-message {
  @apply text-red-500 text-sm mt-1 flex items-center;
}

/* Estado de éxito */
.form-input.success {
  @apply border-green-500 bg-green-50 focus:ring-green-500;
}
```

## ⚡ **Beneficios**

1. **UX Mejorada**: Usuario ve exactamente qué corregir
2. **Validación Consistente**: Mismas reglas en crear/actualizar  
3. **Debugging Fácil**: Errores específicos por campo
4. **Código Limpio**: Estructura predecible de errores
5. **Navegación Funcional**: Calendario ya no se queda atascado