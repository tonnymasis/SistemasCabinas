import { NextRequest, NextResponse } from 'next/server';
import { BookingRepository } from '@/lib/data/BookingRepository';
import { BookingService } from '@/lib/domain/BookingService';

const repository = new BookingRepository();
const bookingService = new BookingService(repository);

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cabinId = searchParams.get('cabinId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    let bookings = await repository.getAllBookings();
    
    if (cabinId) {
      bookings = bookings.filter(b => b.cabinId === cabinId);
    }
    
    if (month && year) {
      const monthNum = parseInt(month);
      const yearNum = parseInt(year);
      bookings = bookings.filter(b => {
        const checkIn = new Date(b.checkIn);
        const checkOut = new Date(b.checkOut);
        return (checkIn.getFullYear() === yearNum && checkIn.getMonth() + 1 === monthNum) ||
               (checkOut.getFullYear() === yearNum && checkOut.getMonth() + 1 === monthNum);
      });
    }

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const bookingData = await request.json();
    
    // Validaciones completas con contexto y campos específicos
    const validationErrors = await bookingService.validateBookingWithContext(bookingData);
    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Datos de reserva inválidos', 
          fieldErrors: validationErrors,
          details: validationErrors.map(e => e.message)
        }, 
        { status: 400 }
      );
    }

    // Asignar timestamps
    bookingData.createdAt = new Date().toISOString();
    bookingData.updatedAt = new Date().toISOString();

    const booking = await repository.createBooking(bookingData);
    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error('Error creating booking:', error);
    
    // Manejar errores de JSON inválido
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Formato de datos inválido',
          fieldErrors: [{ field: 'general', message: 'Los datos enviados no tienen un formato JSON válido' }]
        }, 
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Error interno del servidor',
        fieldErrors: [{ field: 'general', message: 'Ocurrió un error interno del servidor' }]
      }, 
      { status: 500 }
    );
  }
}