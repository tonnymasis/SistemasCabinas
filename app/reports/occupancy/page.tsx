'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking, Cabin } from '@/lib/domain/entities';

interface OccupancyData {
  month: number;
  year: number;
  totalDays: number;
  occupiedDays: number;
  occupancyRate: number;
  totalRevenue: number;
  cabinOccupancy: Array<{
    cabinId: string;
    cabinName: string;
    occupiedDays: number;
    occupancyRate: number;
    revenue: number;
  }>;
}

export default function OccupancyReportPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [occupancyData, setOccupancyData] = useState<OccupancyData | null>(null);
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [currentMonth, currentYear]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Cargar cabañas y reservas en paralelo
      const [bookingsResponse, cabinsResponse] = await Promise.all([
        fetch('/api/bookings'),
        fetch('/api/cabins')
      ]);

      const bookings: Booking[] = bookingsResponse.ok ? await bookingsResponse.json() : [];
      const cabinsData: Cabin[] = cabinsResponse.ok ? await cabinsResponse.json() : [];
      setCabins(cabinsData);

      // Calcular ocupación para el mes seleccionado
      const occupancy = calculateOccupancy(bookings, cabinsData, currentMonth, currentYear);
      setOccupancyData(occupancy);
    } catch (error) {
      console.error('Error loading occupancy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOccupancy = (bookings: Booking[], cabins: Cabin[], month: number, year: number): OccupancyData => {
    const daysInMonth = new Date(year, month, 0).getDate();
    const totalPossibleDays = cabins.length * daysInMonth;
    
    let totalOccupiedDays = 0;
    let totalRevenue = 0;

    const cabinOccupancy = cabins.map(cabin => {
      let cabinOccupiedDays = 0;
      let cabinRevenue = 0;

      // Filtrar reservas de esta cabaña en este mes
      const cabinBookings = bookings.filter(booking => 
        booking.cabinId === cabin.id &&
        doDateRangesOverlap(booking.checkIn, booking.checkOut, month, year)
      );

      // Calcular días ocupados
      for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month - 1, day);
        const isOccupied = cabinBookings.some(booking => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          return currentDate >= checkIn && currentDate < checkOut;
        });

        if (isOccupied) {
          cabinOccupiedDays++;
        }
      }

      // Calcular ingresos de las reservas que están en este mes
      cabinBookings.forEach(booking => {
        const checkIn = new Date(booking.checkIn);
        const checkOut = new Date(booking.checkOut);
        
        // Calcular días de la reserva que caen en este mes
        const monthStart = new Date(year, month - 1, 1);
        const monthEnd = new Date(year, month, 0);
        
        const overlapStart = checkIn > monthStart ? checkIn : monthStart;
        const overlapEnd = checkOut < monthEnd ? checkOut : monthEnd;
        
        if (overlapStart < overlapEnd) {
          const daysInThisMonth = Math.ceil((overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60 * 24));
          const totalBookingDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
          const proportionInMonth = daysInThisMonth / totalBookingDays;
          cabinRevenue += booking.amount * proportionInMonth;
        }
      });

      totalOccupiedDays += cabinOccupiedDays;
      totalRevenue += cabinRevenue;

      return {
        cabinId: cabin.id,
        cabinName: cabin.name,
        occupiedDays: cabinOccupiedDays,
        occupancyRate: (cabinOccupiedDays / daysInMonth) * 100,
        revenue: cabinRevenue
      };
    });

    return {
      month,
      year,
      totalDays: totalPossibleDays,
      occupiedDays: totalOccupiedDays,
      occupancyRate: (totalOccupiedDays / totalPossibleDays) * 100,
      totalRevenue,
      cabinOccupancy
    };
  };

  const doDateRangesOverlap = (checkIn: string, checkOut: string, month: number, year: number): boolean => {
    const bookingStart = new Date(checkIn);
    const bookingEnd = new Date(checkOut);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0);
    
    return bookingStart <= monthEnd && bookingEnd > monthStart;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  const handleMonthChange = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      if (currentMonth === 1) {
        setCurrentMonth(12);
        setCurrentYear(currentYear - 1);
      } else {
        setCurrentMonth(currentMonth - 1);
      }
    } else {
      if (currentMonth === 12) {
        setCurrentMonth(1);
        setCurrentYear(currentYear + 1);
      } else {
        setCurrentMonth(currentMonth + 1);
      }
    }
  };

  const getOccupancyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 bg-green-100';
    if (rate >= 60) return 'text-blue-600 bg-blue-100';
    if (rate >= 40) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Cargando reporte de ocupación...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Tasa de Ocupación
              </h1>
              <p className="text-gray-600">
                Análisis de ocupación y rentabilidad por cabaña
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleMonthChange('prev')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                ←
              </button>
              <span className="px-6 py-2 bg-blue-100 text-blue-800 rounded-lg font-semibold">
                {monthNames[currentMonth - 1]} {currentYear}
              </span>
              <button
                onClick={() => handleMonthChange('next')}
                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                →
              </button>
            </div>
          </div>
        </header>

        {occupancyData && (
          <>
            {/* Resumen General */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-blue-600 text-xl">📊</span>
                  </div>
                  <div>
                    <div className={`text-2xl font-bold ${getOccupancyColor(occupancyData.occupancyRate).split(' ')[0]}`}>
                      {occupancyData.occupancyRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Ocupación Total</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-green-600 text-xl">💰</span>
                  </div>
                  <div>
                    <div className="text-xl font-bold text-gray-800">
                      {formatCurrency(occupancyData.totalRevenue)}
                    </div>
                    <div className="text-sm text-gray-600">Ingresos Totales</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-yellow-600 text-xl">📅</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {occupancyData.occupiedDays}
                    </div>
                    <div className="text-sm text-gray-600">Días Ocupados</div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                    <span className="text-purple-600 text-xl">🏠</span>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-800">
                      {cabins.length}
                    </div>
                    <div className="text-sm text-gray-600">Cabañas Activas</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detalle por Cabaña */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">
                  Rendimiento por Cabaña
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabaña</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Ocupados</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tasa de Ocupación</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingresos</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingreso/Día</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {occupancyData.cabinOccupancy
                      .sort((a, b) => b.occupancyRate - a.occupancyRate)
                      .map((cabin) => {
                        const avgDailyRevenue = cabin.occupiedDays > 0 ? cabin.revenue / cabin.occupiedDays : 0;
                        
                        return (
                          <tr key={cabin.cabinId}>
                            <td className="px-6 py-4">
                              <div className="font-medium text-gray-900">{cabin.cabinName}</div>
                              <div className="text-sm text-gray-500">{cabin.cabinId}</div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {cabin.occupiedDays} / {occupancyData.totalDays / cabins.length} días
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getOccupancyColor(cabin.occupancyRate)}`}>
                                {cabin.occupancyRate.toFixed(1)}%
                              </span>
                            </td>
                            <td className="px-6 py-4 font-semibold text-gray-900">
                              {formatCurrency(cabin.revenue)}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {formatCurrency(avgDailyRevenue)}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}