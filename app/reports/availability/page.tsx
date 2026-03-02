'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking, Cabin } from '@/lib/domain/entities';

interface AvailabilityDay {
  date: Date;
  dateString: string;
  dayOfWeek: number;
  cabins: Array<{
    cabinId: string;
    cabinName: string;
    isAvailable: boolean;
    booking?: Booking;
  }>;
  availableCount: number;
}

export default function FutureAvailabilityPage() {
  const [availabilityData, setAvailabilityData] = useState<AvailabilityDay[]>([]);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<AvailabilityDay | null>(null);

  useEffect(() => {
    loadAvailabilityData();
  }, [startDate]);

  const loadAvailabilityData = async () => {
    setLoading(true);
    try {
      const [bookingsResponse, cabinsResponse] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/cabins')
      ]);

      const bookings: Booking[] = bookingsResponse.ok ? await bookingsResponse.json() : [];
      const cabinsData: Cabin[] = cabinsResponse.ok ? await cabinsResponse.json() : [];
      setCabins(cabinsData);

      const availability = generateAvailabilityData(bookings, cabinsData, startDate);
      setAvailabilityData(availability);
    } catch (error) {
      console.error('Error loading availability data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateAvailabilityData = (bookings: Booking[], cabins: Cabin[], startDate: Date): AvailabilityDay[] => {
    const data: AvailabilityDay[] = [];
    
    for (let i = 0; i < 90; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateString = currentDate.toISOString().split('T')[0];
      
      const cabinAvailability = cabins.map(cabin => {
        const cabinBooking = bookings.find(booking => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          return booking.cabinId === cabin.id && 
                 currentDate >= checkIn && 
                 currentDate < checkOut;
        });

        return {
          cabinId: cabin.id,
          cabinName: cabin.name,
          isAvailable: !cabinBooking,
          booking: cabinBooking
        };
      });

      const availableCount = cabinAvailability.filter(c => c.isAvailable).length;

      data.push({
        date: new Date(currentDate),
        dateString,
        dayOfWeek: currentDate.getDay(),
        cabins: cabinAvailability,
        availableCount
      });
    }

    return data;
  };

  const moveTimeframe = (direction: 'prev' | 'next') => {
    const newDate = new Date(startDate);
    if (direction === 'prev') {
      newDate.setDate(startDate.getDate() - 30);
    } else {
      newDate.setDate(startDate.getDate() + 30);
    }
    setStartDate(newDate);
  };

  const resetToToday = () => {
    setStartDate(new Date());
  };

  const handleDayClick = (day: AvailabilityDay) => {
    setSelectedDay(day);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit'
    });
  };

  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const getAvailabilityColor = (availableCount: number, totalCount: number) => {
    const percentage = (availableCount / totalCount) * 100;
    if (percentage === 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-green-400';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 25) return 'bg-orange-400';
    if (percentage > 0) return 'bg-red-400';
    return 'bg-red-600';
  };

  const getDayClass = (dayOfWeek: number) => {
    return dayOfWeek === 0 || dayOfWeek === 6 ? 'bg-blue-50' : 'bg-white';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Cargando disponibilidad futura...</div>
          </div>
        </div>
      </div>
    );
  }

  const totalCabins = cabins.length;
  const criticalDays = availabilityData.filter(day => day.availableCount === 0).length;
  const lowAvailabilityDays = availabilityData.filter(day => day.availableCount > 0 && day.availableCount <= 2).length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Disponibilidad Futura
              </h1>
              <p className="text-gray-600">
                Próximos 90 días - Click en cualquier día para ver cabañas específicas
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => moveTimeframe('prev')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ← 30 días atrás
              </button>
              <button
                onClick={resetToToday}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Hoy
              </button>
              <button
                onClick={() => moveTimeframe('next')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                30 días adelante →
              </button>
            </div>
          </div>
        </header>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">📅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">90</div>
                <div className="text-sm text-gray-600">Días Analizados</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">🏠</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{totalCabins}</div>
                <div className="text-sm text-gray-600">Cabañas Total</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-red-600 text-xl">⚠️</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{criticalDays}</div>
                <div className="text-sm text-gray-600">Días Sin Disponibilidad</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-yellow-600 text-xl">⏰</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{lowAvailabilityDays}</div>
                <div className="text-sm text-gray-600">Días Baja Disponibilidad</div>
              </div>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Leyenda de Colores</h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded mr-2"></div>
              <span>Completamente Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-400 rounded mr-2"></div>
              <span>75%+ Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-yellow-400 rounded mr-2"></div>
              <span>50%+ Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-orange-400 rounded mr-2"></div>
              <span>25%+ Disponible</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-400 rounded mr-2"></div>
              <span>Poca Disponibilidad</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-red-600 rounded mr-2"></div>
              <span>Sin Disponibilidad</span>
            </div>
          </div>
        </div>

        {/* Calendario Compacto */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Calendario de Disponibilidad
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Desde {formatFullDate(startDate)} - Click en cualquier día para ver cabañas específicas
            </p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-7 gap-1 mb-4">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-600 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
              {availabilityData.map((day) => {
                const availableCabins = day.cabins.filter(c => c.isAvailable).map(c => c.cabinName);
                const occupiedCabins = day.cabins.filter(c => !c.isAvailable);
                
                const tooltipContent = `${formatFullDate(day.date)}\n\n` +
                  `DISPONIBLES (${availableCabins.length}):\n${availableCabins.length > 0 ? availableCabins.join(', ') : 'Ninguna'}\n\n` +
                  `OCUPADAS (${occupiedCabins.length}):\n${occupiedCabins.length > 0 ? occupiedCabins.map(c => `${c.cabinName} (${c.booking?.clientName})`).join(', ') : 'Ninguna'}`;
                
                return (
                  <div
                    key={day.dateString}
                    className={`${getDayClass(day.dayOfWeek)} border border-gray-200 p-2 min-h-[100px] rounded cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group relative ${selectedDay?.dateString === day.dateString ? 'ring-2 ring-blue-500 bg-blue-50' : ''}`}
                    title={tooltipContent}
                    onClick={() => handleDayClick(day)}
                  >
                    <div className="text-sm font-medium text-gray-800 mb-1">
                      {formatDate(day.date)}
                    </div>
                    
                    <div className="space-y-1">
                      <div className={`h-3 rounded ${getAvailabilityColor(day.availableCount, totalCabins)}`}></div>
                      <div className="text-xs text-gray-600 text-center font-semibold">
                        {day.availableCount}/{totalCabins}
                      </div>
                      
                      {/* Lista compacta de cabañas disponibles */}
                      {availableCabins.length > 0 && (
                        <div className="text-xs text-green-700 leading-tight">
                          <div className="font-medium">Disponibles:</div>
                          <div className="truncate">
                            {availableCabins.length <= 2 
                              ? availableCabins.join(', ')
                              : `${availableCabins.slice(0, 2).join(', ')}...`
                            }
                          </div>
                        </div>
                      )}
                      
                      {/* Lista compacta de cabañas ocupadas */}
                      {occupiedCabins.length > 0 && occupiedCabins.length <= 2 && (
                        <div className="text-xs text-red-700 leading-tight">
                          <div className="font-medium">Ocupadas:</div>
                          <div className="truncate">
                            {occupiedCabins.map(c => c.cabinName).join(', ')}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip expandido en hover */}
                    <div className="absolute left-full top-0 ml-2 w-64 bg-gray-900 text-white text-xs rounded p-3 opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none shadow-lg">
                      <div className="font-semibold mb-2">{formatFullDate(day.date)}</div>
                      
                      {availableCabins.length > 0 && (
                        <div className="mb-2">
                          <div className="text-green-300 font-medium">✓ DISPONIBLES ({availableCabins.length}):</div>
                          <div className="pl-2">{availableCabins.join(', ')}</div>
                        </div>
                      )}
                      
                      {occupiedCabins.length > 0 && (
                        <div>
                          <div className="text-red-300 font-medium">✗ OCUPADAS ({occupiedCabins.length}):</div>
                          <div className="pl-2 space-y-1">
                            {occupiedCabins.map((c, idx) => (
                              <div key={idx}>
                                <span className="font-medium">{c.cabinName}</span>
                                {c.booking && (
                                  <span className="text-gray-300"> - {c.booking.clientName}</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Panel Detallado del Día Seleccionado */}
        {selectedDay && (
          <div className="mt-8 bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">
                  Detalle de Disponibilidad
                </h3>
                <p className="text-gray-600">{formatFullDate(selectedDay.date)}</p>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Cabañas Disponibles */}
                <div>
                  <h4 className="text-lg font-semibold text-green-700 mb-4 flex items-center">
                    <span className="w-4 h-4 bg-green-500 rounded mr-2"></span>
                    Cabañas Disponibles ({selectedDay.cabins.filter(c => c.isAvailable).length})
                  </h4>
                  <div className="space-y-3">
                    {selectedDay.cabins.filter(c => c.isAvailable).length > 0 ? (
                      selectedDay.cabins
                        .filter(c => c.isAvailable)
                        .map((cabin) => (
                          <div key={cabin.cabinId} className="flex items-center p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                            <div>
                              <div className="font-medium text-green-800">{cabin.cabinName}</div>
                              <div className="text-sm text-green-600">Lista para reservar</div>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl mb-2 block">🚫</span>
                        No hay cabañas disponibles este día
                      </div>
                    )}
                  </div>
                </div>

                {/* Cabañas Ocupadas */}
                <div>
                  <h4 className="text-lg font-semibold text-red-700 mb-4 flex items-center">
                    <span className="w-4 h-4 bg-red-500 rounded mr-2"></span>
                    Cabañas Ocupadas ({selectedDay.cabins.filter(c => !c.isAvailable).length})
                  </h4>
                  <div className="space-y-3">
                    {selectedDay.cabins.filter(c => !c.isAvailable).length > 0 ? (
                      selectedDay.cabins
                        .filter(c => !c.isAvailable)
                        .map((cabin) => (
                          <div key={cabin.cabinId} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-3"></div>
                            <div className="flex-1">
                              <div className="font-medium text-red-800">{cabin.cabinName}</div>
                              {cabin.booking && (
                                <div className="text-sm text-red-600 space-y-1">
                                  <div><strong>Huésped:</strong> {cabin.booking.clientName}</div>
                                  <div><strong>Estadía:</strong> {formatDate(new Date(cabin.booking.checkIn))} - {formatDate(new Date(cabin.booking.checkOut))}</div>
                                  <div><strong>Canal:</strong> {cabin.booking.reservationChannel}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <span className="text-4xl mb-2 block">🎉</span>
                        Todas las cabañas están disponibles
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen del Día */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{selectedDay.availableCount}</div>
                    <div className="text-sm text-gray-600">Disponibles</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{selectedDay.cabins.length - selectedDay.availableCount}</div>
                    <div className="text-sm text-gray-600">Ocupadas</div>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-gray-800">{((selectedDay.availableCount / selectedDay.cabins.length) * 100).toFixed(0)}%</div>
                    <div className="text-sm text-gray-600">Disponibilidad</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Alertas de Disponibilidad Crítica */}
        {criticalDays > 0 && (
          <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center mb-4">
              <span className="text-red-600 text-2xl mr-3">⚠️</span>
              <h3 className="text-lg font-semibold text-red-800">
                Alertas de Disponibilidad Crítica
              </h3>
            </div>
            <p className="text-red-700 mb-4">
              Se detectaron <strong>{criticalDays} días completamente ocupados</strong> en los próximos 90 días. 
              Considera implementar una lista de espera o aumentar precios en estos períodos.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availabilityData
                .filter(day => day.availableCount === 0)
                .slice(0, 12) // Mostrar máximo 12 días críticos
                .map(day => (
                  <div key={day.dateString} className="bg-white rounded p-3 border border-red-200">
                    <div className="font-medium text-red-800">
                      {formatFullDate(day.date)}
                    </div>
                    <div className="text-sm text-red-600">
                      Todas las cabañas ocupadas
                    </div>
                  </div>
                ))}
            </div>
            
            {availabilityData.filter(day => day.availableCount === 0).length > 12 && (
              <p className="text-sm text-red-600 mt-4">
                ... y {availabilityData.filter(day => day.availableCount === 0).length - 12} días más
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}