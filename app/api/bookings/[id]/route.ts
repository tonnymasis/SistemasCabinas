import { NextRequest, NextResponse } from 'next/server';
import { BookingRepository } from '@/lib/data/BookingRepository';
import { BookingService } from '@/lib/domain/BookingService';
import { Booking } from '@/lib/domain/entities';

const repository = new BookingRepository();
const bookingService = new BookingService(repository);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const booking = await repository.getBookingById(id);
    
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }
    
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    return NextResponse.json({ error: 'Failed to fetch booking' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const bookingData = await request.json();
    
    // Verificar que la reserva existe
    const existingBooking = await repository.getBookingById(id);
    if (!existingBooking) {
      return NextResponse.json(
        { 
          error: 'Reserva no encontrada',
          fieldErrors: [{ field: 'general', message: 'La reserva especificada no existe' }]
        }, 
        { status: 404 }
      );
    }
    
    // Asegurar que el ID no se cambie
    bookingData.id = id;
    
    // Validaciones completas con contexto y campos específicos, excluyendo la reserva actual
    const validationErrors = await bookingService.validateBookingWithContext(bookingData, id);
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

    // Mantener timestamp de creación y actualizar el de modificación
    bookingData.createdAt = existingBooking.createdAt;
    bookingData.updatedAt = new Date().toISOString();

    const booking = await repository.updateBooking(id, bookingData);
    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verificar que el ID sea válido
    if (!id?.trim()) {
      return NextResponse.json(
        { error: 'ID de reserva requerido' }, 
        { status: 400 }
      );
    }
    
    // Verificar que la reserva existe antes de eliminar
    const existingBooking = await repository.getBookingById(id);
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Reserva no encontrada' }, 
        { status: 404 }
      );
    }
    
    const deleted = await repository.deleteBooking(id);
    
    return NextResponse.json({ 
      success: true,
      message: 'Reserva eliminada exitosamente' 
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' }, 
      { status: 500 }
    );
  }
}