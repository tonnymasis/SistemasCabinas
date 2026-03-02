import { Booking } from './entities';
import { BookingRepository } from '../data/BookingRepository';
import { ValidationUtils, ValidationError } from '../utils/validation';

export class BookingService {
  constructor(private repository: BookingRepository) {}

  async checkOverlap(booking: Booking, excludeId?: string): Promise<boolean> {
    const bookings = await this.repository.getAllBookings();
    const checkIn = new Date(booking.checkIn);
    const checkOut = new Date(booking.checkOut);

    return bookings.some(existing => {
      if (excludeId && existing.id === excludeId) return false;
      if (existing.cabinId !== booking.cabinId) return false;

      const existingCheckIn = new Date(existing.checkIn);
      const existingCheckOut = new Date(existing.checkOut);

      // Check-out es exclusivo, check-in es inclusivo
      return (
        (checkIn >= existingCheckIn && checkIn < existingCheckOut) ||
        (checkOut > existingCheckIn && checkOut <= existingCheckOut) ||
        (checkIn <= existingCheckIn && checkOut >= existingCheckOut)
      );
    });
  }

  calculateBalance(booking: Booking): number {
    return booking.amount - booking.deposit;
  }

  calculateNet(booking: Booking): number {
    return booking.amount - booking.commission;
  }

  validateBooking(booking: Partial<Booking>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    // Validaciones básicas de campos
    errors.push(...ValidationUtils.validateBookingFields(booking));
    
    // Validaciones específicas de fechas
    errors.push(...ValidationUtils.validateBookingDates(booking));
    
    // Validaciones de montos con relaciones
    errors.push(...ValidationUtils.validateBookingAmounts(booking));
    
    return errors;
  }
  
  async validateBookingWithContext(booking: Partial<Booking>, excludeId?: string): Promise<ValidationError[]> {
    const errors = this.validateBooking(booking);
    
    // Validaciones que requieren acceso a la base de datos
    if (booking.cabinId && errors.filter(e => e.field === 'cabinId').length === 0) {
      // Verificar que la cabaña exista
      const cabin = await this.repository.getCabinById(booking.cabinId);
      if (!cabin) {
        errors.push({ field: 'cabinId', message: 'La cabaña especificada no existe' });
      } else {
        // Verificar capacidad
        if (booking.numberOfGuests && booking.numberOfGuests > cabin.capacity) {
          errors.push({ 
            field: 'numberOfGuests', 
            message: `La capacidad máxima de esta cabaña es ${cabin.capacity} personas` 
          });
        }
      }
    }
    
    // Verificar disponibilidad (sin solapamiento) solo si las fechas son válidas
    if (booking.checkIn && booking.checkOut && 
        errors.filter(e => ['checkIn', 'checkOut'].includes(e.field)).length === 0) {
      const hasOverlap = await this.checkOverlap(booking as Booking, excludeId);
      if (hasOverlap) {
        errors.push({ 
          field: 'checkIn', 
          message: 'La cabaña ya está ocupada en las fechas seleccionadas' 
        });
      }
    }
    
    return errors;
  }
}