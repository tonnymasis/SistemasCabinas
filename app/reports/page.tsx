'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { CabinCalendar } from '@/components/CabinCalendar';
import { Cabin } from '@/lib/domain/entities';

export default function AvailabilityPage() {
  const [cabins, setCabins] = useState<Cabin[]>([]);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchCabins();
  }, []);

  const fetchCabins = async () => {
    try {
      const response = await fetch('/api/cabins');
      const data = await response.json();
      setCabins(data);
    } catch (error) {
      console.error('Error fetching cabins:', error);
    }
  };

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Consulta de Disponibilidad
          </h1>
          <p className="text-gray-600">
            {monthNames[currentMonth - 1]} {currentYear} - Solo lectura
          </p>
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Modo consulta:</strong> Esta vista es solo para consultar disponibilidad. 
              Para crear o editar reservas, usa <Link href="/reports/all" className="underline font-medium">Gestión de Reservas</Link>.
            </p>
          </div>
        </header>

        {cabins.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg mb-4">Cargando cabañas...</div>
          </div>
        ) : (
          <div className="space-y-8">
            {cabins.map(cabin => (
              <CabinCalendar
                key={cabin.id}
                cabin={cabin}
                month={currentMonth}
                year={currentYear}
                onMonthChange={handleMonthChange}
                readOnly={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}