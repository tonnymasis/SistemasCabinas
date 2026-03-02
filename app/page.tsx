'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Booking, Cabin } from '@/lib/domain/entities';

interface DashboardStats {
  activeReservations: number;
  availableCabins: number;
  todayCheckIns: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<DashboardStats>({
    activeReservations: 0,
    availableCabins: 0,
    todayCheckIns: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        // Cargar reservas
        const bookingsResponse = await fetch('/api/bookings');
        const bookings: Booking[] = bookingsResponse.ok ? await bookingsResponse.json() : [];
        
        // Cargar cabañas para contar el total
        const cabinsResponse = await fetch('/api/cabins');
        const cabins: Cabin[] = cabinsResponse.ok ? await cabinsResponse.json() : [];
        const totalCabins = cabins.length;
        
        const today = new Date();
        const todayStr = today.toISOString().split('T')[0];
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        
        // Calcular estadísticas
        const activeReservations = bookings.filter(booking => {
          const checkIn = new Date(booking.checkIn);
          const checkOut = new Date(booking.checkOut);
          return checkIn <= today && checkOut > today;
        }).length;
        
        const todayCheckIns = bookings.filter(booking => 
          booking.checkIn === todayStr
        ).length;
        
        // Calcular cabañas disponibles: que tengan al menos 1 día libre en el mes actual
        const availableCabins = cabins.filter(cabin => {
          // Verificar si la cabaña tiene días libres en el mes actual
          const cabinBookings = bookings.filter(b => b.cabinId === cabin.id);
          
          // Obtener todos los días del mes actual
          const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
          let hasAvailableDay = false;
          
          for (let day = 1; day <= daysInMonth; day++) {
            const checkDate = new Date(currentYear, currentMonth - 1, day);
            const isOccupied = cabinBookings.some(booking => {
              const checkIn = new Date(booking.checkIn);
              const checkOut = new Date(booking.checkOut);
              return checkDate >= checkIn && checkDate < checkOut;
            });
            
            if (!isOccupied) {
              hasAvailableDay = true;
              break;
            }
          }
          
          return hasAvailableDay;
        }).length;
        
        setStats({
          activeReservations,
          availableCabins: Math.max(0, availableCabins),
          todayCheckIns
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardStats();
  }, []);
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Sistema de Cabañas Cahuita
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Gestión de reservas y disponibilidad
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link 
            href="/reports" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4">
                📅
              </div>
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                Ver Disponibilidad
              </h2>
            </div>
            <p className="text-gray-600">
              Consulta la disponibilidad de todas las cabañas (solo lectura)
            </p>
          </Link>

          <Link 
            href="/reports/all" 
            className="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-200 group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4">
                📝
              </div>
              <h2 className="text-xl font-semibold text-gray-800 group-hover:text-green-600">
                Gestión de Reservas
              </h2>
            </div>
            <p className="text-gray-600">
              Crear, editar y gestionar reservas desde el calendario
            </p>
          </Link>

          <div className="bg-gray-100 rounded-lg shadow p-6 border border-gray-200 opacity-75">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-gray-400 rounded-lg flex items-center justify-center text-white text-xl font-bold mr-4">
                🏠
              </div>
              <h2 className="text-xl font-semibold text-gray-600">
                Administrar Cabañas
              </h2>
            </div>
            <p className="text-gray-500">
              Próximamente - Configurar cabañas y capacidades
            </p>
          </div>
        </div>

        {/* Admin Tools */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Herramientas de Administración</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link 
              href="/reports/backups" 
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl transition-shadow border border-gray-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  💾
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600">
                  Sistema de Backups
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Gestionar copias de seguridad y restauración de datos
              </p>
            </Link>
            
            {/* Placeholder para otras herramientas admin */}
            <div className="bg-gray-100 rounded-lg shadow p-6 border border-gray-200 opacity-75">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-gray-400 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  ⚙️
                </div>
                <h3 className="text-lg font-semibold text-gray-600">
                  Configuración Global
                </h3>
              </div>
              <p className="text-sm text-gray-500">
                Próximamente - Ajustes del sistema
              </p>
            </div>
          </div>
        </div>

        {/* Reportes Críticos */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Reportes Críticos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link 
              href="/reports/payments" 
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl transition-shadow border border-gray-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  💰
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-red-600">
                  Estado de Pagos
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Pagos pendientes y por cobrar
              </p>
            </Link>

            <Link 
              href="/reports/occupancy" 
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl transition-shadow border border-gray-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  📊
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-600">
                  Tasa de Ocupación
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Análisis mensual de ocupación
              </p>
            </Link>

            <Link 
              href="/reports/availability" 
              className="bg-white rounded-lg shadow p-6 hover:shadow-xl transition-shadow border border-gray-200 group"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold mr-3">
                  📅
                </div>
                <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-600">
                  Disponibilidad Futura
                </h3>
              </div>
              <p className="text-sm text-gray-600">
                Próximos 90 días
              </p>
            </Link>
          </div>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado Actual</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : stats.activeReservations}
              </div>
              <div className="text-sm text-gray-600">Reservas Activas</div>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {loading ? '...' : stats.availableCabins}
              </div>
              <div className="text-sm text-gray-600">Cabañas Disponibles</div>
            </div>
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">
                {loading ? '...' : stats.todayCheckIns}
              </div>
              <div className="text-sm text-gray-600">Check-ins Hoy</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}