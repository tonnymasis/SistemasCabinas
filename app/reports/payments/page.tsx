'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Booking } from '@/lib/domain/entities';

interface PaymentReport {
  total: number;
  pending: number;
  partial: number;
  paid: number;
  pendingBookings: Booking[];
  partialBookings: Booking[];
}

export default function PaymentsReportPage() {
  const [report, setReport] = useState<PaymentReport>({
    total: 0,
    pending: 0,
    partial: 0,
    paid: 0,
    pendingBookings: [],
    partialBookings: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaymentReport();
  }, []);

  const loadPaymentReport = async () => {
    try {
      const response = await fetch('/api/bookings');
      const bookings: Booking[] = response.ok ? await response.json() : [];
      
      const now = new Date();
      
      // Filtrar solo reservas futuras y actuales
      const activeBookings = bookings.filter(booking => {
        const checkOut = new Date(booking.checkOut);
        return checkOut >= now;
      });
      
      const pendingBookings = activeBookings.filter(b => b.paymentStatus === 'Pendiente');
      const partialBookings = activeBookings.filter(b => b.paymentStatus === 'Parcial');
      const paidBookings = activeBookings.filter(b => b.paymentStatus === 'Pagado');
      
      setReport({
        total: activeBookings.length,
        pending: pendingBookings.length,
        partial: partialBookings.length,
        paid: paidBookings.length,
        pendingBookings,
        partialBookings
      });
    } catch (error) {
      console.error('Error loading payment report:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CR', {
      style: 'currency',
      currency: 'CRC'
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Cargando reporte de pagos...</div>
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Estado de Pagos
          </h1>
          <p className="text-gray-600">
            Monitoreo de pagos pendientes y por cobrar
          </p>
        </header>

        {/* Resumen de Estados */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">{report.total}</div>
                <div className="text-sm text-gray-600">Total Reservas</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-red-600 text-xl">⏰</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{report.pending}</div>
                <div className="text-sm text-gray-600">Pagos Pendientes</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-yellow-600 text-xl">🔄</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{report.partial}</div>
                <div className="text-sm text-gray-600">Pagos Parciales</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{report.paid}</div>
                <div className="text-sm text-gray-600">Pagos Completos</div>
              </div>
            </div>
          </div>
        </div>

        {/* Pagos Pendientes */}
        {report.pendingBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-8">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-red-600 flex items-center">
                <span className="mr-2">⚠️</span>
                Pagos Pendientes Urgentes ({report.pendingBookings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabaña</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monto Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Canal</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días Restantes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.pendingBookings.map((booking) => {
                    const checkIn = new Date(booking.checkIn);
                    const daysUntilCheckIn = Math.ceil((checkIn.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                    const isUrgent = daysUntilCheckIn <= 7;
                    
                    return (
                      <tr key={booking.id} className={isUrgent ? 'bg-red-50' : ''}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{booking.clientName}</div>
                          <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.cabinId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-semibold text-gray-900">
                            {formatCurrency(booking.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.reservationChannel}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            isUrgent 
                              ? 'bg-red-100 text-red-800' 
                              : daysUntilCheckIn <= 14 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-green-100 text-green-800'
                          }`}>
                            {daysUntilCheckIn > 0 ? `${daysUntilCheckIn} días` : 'Vencido'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagos Parciales */}
        {report.partialBookings.length > 0 && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-yellow-600 flex items-center">
                <span className="mr-2">🔄</span>
                Pagos Parciales por Completar ({report.partialBookings.length})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cabaña</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fechas</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pagado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendiente</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.partialBookings.map((booking) => {
                    const remaining = booking.amount - booking.deposit;
                    
                    return (
                      <tr key={booking.id}>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{booking.clientName}</div>
                          <div className="text-sm text-gray-500">{booking.clientEmail}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">{booking.cabinId}</td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                        </td>
                        <td className="px-6 py-4 text-lg font-semibold text-gray-900">
                          {formatCurrency(booking.amount)}
                        </td>
                        <td className="px-6 py-4 text-lg font-semibold text-green-600">
                          {formatCurrency(booking.deposit)}
                        </td>
                        <td className="px-6 py-4 text-lg font-semibold text-red-600">
                          {formatCurrency(remaining)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {report.pendingBookings.length === 0 && report.partialBookings.length === 0 && (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-green-600 text-6xl mb-4">✅</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">¡Todos los pagos al día!</h3>
            <p className="text-gray-600">No hay pagos pendientes o parciales por gestionar.</p>
          </div>
        )}
      </div>
    </div>
  );
}