/**
 * Utilidades de validación para el sistema de reservas
 * Incluye funciones helper para validaciones comunes
 */

import { Booking } from '../domain/entities';

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export class ValidationUtils {
  
  /**
   * Valida el formato de una fecha ISO
   */
  static isValidDate(dateString: string): boolean {
    if (!dateString) return false;
    const date = new Date(dateString);
    return !isNaN(date.getTime()) && (dateString.includes('T') || !!dateString.match(/^\d{4}-\d{2}-\d{2}$/));
  }

  /**
   * Valida que una fecha no esté en el pasado (permite el día actual)
   */
  static isNotInPast(dateString: string): boolean {
    if (!dateString) return false;
    
    // Crear fechas locales para evitar problemas de zona horaria
    const [year, month, day] = dateString.split('-').map(Number);
    const inputDate = new Date(year, month - 1, day); // Mes es 0-indexed
    
    const today = new Date();
    const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    // Permitir reservas para hoy y fechas futuras
    return inputDate >= todayLocal;
  }

  /**
   * Valida que una fecha no esté en el pasado (excluyendo el día actual)
   * Solo para validaciones estrictas donde necesitemos fechas futuras
   */
  static isStrictlyInFuture(dateString: string): boolean {
    const date = new Date(dateString);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    return date >= tomorrow;
  }

  /**
   * Calcula los días entre dos fechas
   */
  static daysBetween(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Valida formato de teléfono
   */
  static isValidPhone(phone: string): boolean {
    if (!phone) return false;
    // Permite números, espacios, guiones, paréntesis y signo +
    return /^[\d\s\-\+\(\)]{7,20}$/.test(phone.trim());
  }

  /**
   * Valida que un texto no esté vacío y no exceda la longitud máxima
   */
  static isValidText(text: string | undefined, maxLength: number = 100): boolean {
    return !!text && text.trim().length > 0 && text.trim().length <= maxLength;
  }

  /**
   * Valida que un número sea positivo y dentro de un rango
   */
  static isValidPositiveNumber(value: any, max: number = Number.MAX_SAFE_INTEGER): boolean {
    return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= max;
  }

  /**
   * Valida que un número entero sea positivo y dentro de un rango
   */
  static isValidPositiveInteger(value: any, max: number = Number.MAX_SAFE_INTEGER): boolean {
    return Number.isInteger(value) && value > 0 && value <= max;
  }

  /**
   * Sanitiza un string removiendo caracteres peligrosos
   */
  static sanitizeString(text: string | undefined): string {
    if (!text) return '';
    return text.trim().replace(/[<>]/g, '');
  }

  /**
   * Valida los campos básicos de una reserva con información específica de campos
   */
  static validateBookingFields(booking: Partial<Booking>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (!booking.clientName || !this.isValidText(booking.clientName)) {
      errors.push({ field: 'clientName', message: 'El nombre del cliente es requerido' });
    }

    if (!booking.phone || !this.isValidPhone(booking.phone)) {
      errors.push({ field: 'phone', message: 'El teléfono es requerido y debe tener un formato válido' });
    }

    if (!booking.checkIn || !this.isValidDate(booking.checkIn)) {
      errors.push({ field: 'checkIn', message: 'La fecha de entrada es requerida y debe ser válida' });
    }

    if (!booking.checkOut || !this.isValidDate(booking.checkOut)) {
      errors.push({ field: 'checkOut', message: 'La fecha de salida es requerida y debe ser válida' });
    }

    if (booking.checkIn && booking.checkOut && this.isValidDate(booking.checkIn) && this.isValidDate(booking.checkOut)) {
      if (new Date(booking.checkOut) <= new Date(booking.checkIn)) {
        errors.push({ field: 'checkOut', message: 'La fecha de salida debe ser posterior a la de entrada' });
      }
    }

    if (booking.numberOfGuests !== undefined && !this.isValidPositiveInteger(booking.numberOfGuests, 50)) {
      errors.push({ field: 'numberOfGuests', message: 'El número de huéspedes debe ser entre 1 y 50' });
    }

    if (!booking.cabinId?.trim()) {
      errors.push({ field: 'cabinId', message: 'Debe seleccionar una cabaña' });
    }

    if (!booking.reservationChannel?.trim()) {
      errors.push({ field: 'reservationChannel', message: 'Debe seleccionar un canal de reserva' });
    }

    if (booking.amount !== undefined && !this.isValidPositiveNumber(booking.amount, 1000000)) {
      errors.push({ field: 'amount', message: 'El monto debe ser un número válido entre 0 y $1,000,000' });
    }

    if (booking.deposit !== undefined && !this.isValidPositiveNumber(booking.deposit)) {
      errors.push({ field: 'deposit', message: 'El depósito debe ser un número mayor o igual a 0' });
    }

    if (booking.commission !== undefined && !this.isValidPositiveNumber(booking.commission)) {
      errors.push({ field: 'commission', message: 'La comisión debe ser un número mayor o igual a 0' });
    }

    if (booking.currency && !this.isValidCurrency(booking.currency)) {
      errors.push({ field: 'currency', message: 'La moneda debe ser USD o CRC' });
    }

    return errors;
  }

  /**
   * Validaciones adicionales de fechas con campos específicos
   */
  static validateBookingDates(booking: Partial<Booking>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (booking.checkIn && booking.checkOut && this.isValidDate(booking.checkIn) && this.isValidDate(booking.checkOut)) {
      // Crear fechas locales para evitar problemas de zona horaria
      const [checkInYear, checkInMonth, checkInDay] = booking.checkIn.split('-').map(Number);
      const checkInDate = new Date(checkInYear, checkInMonth - 1, checkInDay); // Mes es 0-indexed
      
      const today = new Date();
      const todayLocal = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      
      // Las fechas no pueden estar en el pasado (pero SÍ permiten hoy)
      if (checkInDate < todayLocal) {
        const todayStr = todayLocal.toISOString().split('T')[0];
        errors.push({ 
          field: 'checkIn', 
          message: `La fecha de entrada no puede ser anterior a hoy (${todayStr}). Se permiten reservas para hoy mismo.` 
        });
      }

      // Debe haber al menos una noche de estadía
      const nights = this.daysBetween(booking.checkIn, booking.checkOut);
      if (nights < 1) {
        errors.push({ field: 'checkOut', message: 'La reserva debe ser de al menos una noche' });
      }

      // No permitir reservas muy largas
      if (nights > 365) {
        errors.push({ field: 'checkOut', message: 'La reserva no puede exceder 365 días' });
      }

      // No permitir reservas muy lejanas en el futuro
      if (!this.isWithinReservationWindow(booking.checkIn)) {
        errors.push({ field: 'checkIn', message: 'No se pueden hacer reservas con más de 2 años de anticipación' });
      }
    }

    return errors;
  }

  /**
   * Validaciones adicionales de montos con campos específicos
   */
  static validateBookingAmounts(booking: Partial<Booking>): ValidationError[] {
    const errors: ValidationError[] = [];

    if (booking.amount !== undefined && booking.deposit !== undefined && booking.deposit > booking.amount) {
      errors.push({ field: 'deposit', message: 'El depósito no puede ser mayor al monto total' });
    }

    if (booking.amount !== undefined && booking.commission !== undefined && booking.commission > booking.amount) {
      errors.push({ field: 'commission', message: 'La comisión no puede ser mayor al monto total' });
    }

    return errors;
  }

  /**
   * Convierte errores específicos a formato simple para retrocompatibilidad
   */
  static errorsToStrings(errors: ValidationError[]): string[] {
    return errors.map(error => error.message);
  }

  /**
   * Formatea un mensaje de error para mostrar al usuario
   */
  static formatErrorMessage(errors: string[]): string {
    if (errors.length === 0) return '';
    if (errors.length === 1) return errors[0];
    return `Se encontraron ${errors.length} errores:\n• ${errors.join('\n• ')}`;
  }

  /**
   * Valida el formato de moneda
   */
  static isValidCurrency(currency: string): boolean {
    return ['USD', 'CRC'].includes(currency);
  }

  /**
   * Valida rango de fechas para no permitir reservas muy lejanas
   */
  static isWithinReservationWindow(checkIn: string, maxDaysInFuture: number = 730): boolean {
    const date = new Date(checkIn);
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + maxDaysInFuture);
    return date <= maxDate;
  }
}

export default ValidationUtils;