'use client';

import { useState, useEffect } from 'react';
import { Booking, Cabin } from '@/lib/domain/entities';
import { Button } from './ui/Button';
import { BookingModal } from './BookingModal';

interface CabinCalendarProps {
  cabin: Cabin;
  month: number;
  year: number;
  onMonthChange: (month: number, year: number) => void;
  readOnly?: boolean;
}

export function CabinCalendar({ cabin, month, year, onMonthChange, readOnly = false }: CabinCalendarProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, [cabin.id, month, year]);

  const fetchBookings = async () => {
    try {
      const response = await fetch(`/api/bookings?cabinId=${cabin.id}&month=${month}&year=${year}`);
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month - 1, 1).getDay();
  };

  const isDateOccupied = (day: number): Booking | null => {
    const date = new Date(year, month - 1, day);
    const dateStr = date.toISOString().split('T')[0];
    
    return bookings.find(booking => {
      const checkIn = new Date(booking.checkIn);
      const checkOut = new Date(booking.checkOut);
      return date >= checkIn && date < checkOut; // Check-out es exclusivo
    }) || null;
  };

  const handleDayClick = (day: number) => {
    if (readOnly) return; // No interacciones en modo solo lectura
    
    const dateStr = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const booking = isDateOccupied(day);
    
    if (booking) {
      setSelectedBooking(booking);
      setSelectedDate(null);
    } else {
      setSelectedBooking(null);
      setSelectedDate(dateStr);
    }
    setIsModalOpen(true);
  };

  const handlePrevMonth = () => {
    if (month === 1) {
      onMonthChange(12, year - 1);
    } else {
      onMonthChange(month - 1, year);
    }
  };

  const handleNextMonth = () => {
    if (month === 12) {
      onMonthChange(1, year + 1);
    } else {
      onMonthChange(month + 1, year);
    }
  };

  const daysInMonth = getDaysInMonth(month, year);
  const firstDayOfMonth = getFirstDayOfMonth(month, year);
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const days = [];
  
  // Días vacíos al inicio
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(<div key={`empty-${i}`} className="h-10" />);
  }
  
  // Días del mes
  for (let day = 1; day <= daysInMonth; day++) {
    const booking = isDateOccupied(day);
    const isOccupied = !!booking;
    
    days.push(
      <button
        key={day}
        onClick={readOnly ? undefined : () => handleDayClick(day)}
        disabled={readOnly}
        className={`h-10 w-full text-sm border rounded transition-colors ${
          isOccupied 
            ? readOnly 
              ? 'bg-red-100 text-red-700 border-red-200 cursor-default' 
              : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200 cursor-pointer'
            : readOnly
              ? 'bg-green-100 text-green-700 border-green-200 cursor-default'
              : 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200 cursor-pointer'
        }`}
        title={
          readOnly 
            ? isOccupied 
              ? `Ocupado - ${booking?.clientName} (Solo lectura)` 
              : 'Disponible (Solo lectura)'
            : isOccupied 
              ? `Ocupado - ${booking?.clientName}` 
              : 'Disponible - Click para reservar'
        }
      >
        {day}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">{cabin.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrevMonth}>
            ←
          </Button>
          <span className="px-4 py-2 font-medium">
            {monthNames[month - 1]} {year}
          </span>
          <Button variant="secondary" onClick={handleNextMonth}>
            →
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="h-8 flex items-center justify-center text-sm font-medium text-gray-600">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {days}
      </div>
      
      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border border-green-300 rounded" />
          <span>Disponible</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-300 rounded" />
          <span>Ocupado</span>
        </div>
      </div>

      {!readOnly && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
            setSelectedBooking(null);
          }}
          onSave={fetchBookings}
          cabin={cabin}
          initialDate={selectedDate}
          booking={selectedBooking}
        />
      )}
    </div>
  );
}