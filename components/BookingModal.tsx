'use client';

import { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { Booking, Cabin, AppConfig } from '@/lib/domain/entities';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  cabin: Cabin;
  initialDate?: string | null;
  booking?: Booking | null;
}

export function BookingModal({ 
  isOpen, 
  onClose, 
  onSave, 
  cabin, 
  initialDate, 
  booking 
}: BookingModalProps) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: '',
    phone: '',
    reservationChannel: '',
    checkIn: '',
    checkOut: '',
    amount: 0,
    currency: 'USD' as 'USD' | 'CRC',
    commission: 0,
    deposit: 0,
    paymentStatus: '',
    paymentMethod: '',
    needsInvoice: false,
    invoiceNotes: '',
    numberOfGuests: 1,
    roomType: '',
    comments: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      setErrors({}); // Limpiar errores al abrir
      
      if (booking) {
        // Editando una reserva existente - cargar sus datos
        setFormData({
          clientName: booking.clientName,
          phone: booking.phone,
          reservationChannel: booking.reservationChannel,
          checkIn: booking.checkIn.split('T')[0],
          checkOut: booking.checkOut.split('T')[0],
          amount: booking.amount,
          currency: booking.currency,
          commission: booking.commission,
          deposit: booking.deposit,
          paymentStatus: booking.paymentStatus,
          paymentMethod: booking.paymentMethod,
          needsInvoice: booking.needsInvoice,
          invoiceNotes: booking.invoiceNotes || '',
          numberOfGuests: booking.numberOfGuests,
          roomType: booking.roomType,
          comments: booking.comments || ''
        });
      } else {
        // Nueva reserva - resetear completamente el formulario
        setFormData({
          clientName: '',
          phone: '',
          reservationChannel: '',
          checkIn: initialDate || '',
          checkOut: '', // ← IMPORTANTE: Limpiar checkOut
          amount: 0,
          currency: 'USD',
          commission: 0,
          deposit: 0,
          paymentStatus: '',
          paymentMethod: '',
          needsInvoice: false,
          invoiceNotes: '',
          numberOfGuests: 1,
          roomType: '',
          comments: ''
        });
      }
    } else {
      // Limpiar errores cuando se cierra el modal
      setErrors({});
    }
  }, [isOpen, booking, initialDate]);

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      setConfig(data);
    } catch (error) {
      console.error('Error fetching config:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Limpiar errores previos
    setErrors({});
    setIsSubmitting(true);

    const bookingData = {
      ...formData,
      cabinId: cabin.id,
      checkIn: new Date(formData.checkIn).toISOString(),
      checkOut: new Date(formData.checkOut).toISOString()
    };

    try {
      let response;
      if (booking) {
        response = await fetch(`/api/bookings/${booking.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
      } else {
        response = await fetch('/api/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bookingData)
        });
      }

      if (response.ok) {
        onSave();
        onClose();
        // Limpiar el formulario al cerrar
        setFormData({
          clientName: '',
          phone: '',
          reservationChannel: '',
          checkIn: '',
          checkOut: '',
          amount: 0,
          currency: 'USD',
          commission: 0,
          deposit: 0,
          paymentStatus: '',
          paymentMethod: '',
          needsInvoice: false,
          invoiceNotes: '',
          numberOfGuests: 1,
          roomType: '',
          comments: ''
        });
      } else {
        const errorData = await response.json();
        
        // Manejar errores específicos por campo
        if (errorData.fieldErrors && Array.isArray(errorData.fieldErrors)) {
          const fieldErrors: Record<string, string> = {};
          errorData.fieldErrors.forEach((err: any) => {
            fieldErrors[err.field] = err.message;
          });
          setErrors(fieldErrors);
        } else {
          // Error general
          setErrors({
            general: errorData.error || 'Error al guardar la reserva'
          });
        }
      }
    } catch (error) {
      console.error('Error saving booking:', error);
      setErrors({
        general: 'Error de conexión al guardar la reserva'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!booking) return;
    
    try {
      const response = await fetch(`/api/bookings/${booking.id}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        onSave();
        onClose();
        setShowDeleteConfirm(false);
      } else {
        alert('Error al eliminar la reserva');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error al eliminar la reserva');
    }
  };

  if (!config) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={booking ? 'Editar Reserva' : 'Nueva Reserva'}
    >
      {errors.general && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-600 text-sm">{errors.general}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Cabaña</label>
          <input
            type="text"
            value={cabin.name}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Cliente *</label>
            <input
              type="text"
              value={formData.clientName}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, clientName: e.target.value }));
                if (errors.clientName) {
                  setErrors(prev => ({ ...prev, clientName: '' }));
                }
              }}
              className={`w-full p-2 border rounded ${
                errors.clientName ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.clientName && (
              <p className="text-red-500 text-sm mt-1">{errors.clientName}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono</label>
            <input
              type="text"
              value={formData.phone}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, phone: e.target.value }));
                if (errors.phone) {
                  setErrors(prev => ({ ...prev, phone: '' }));
                }
              }}
              className={`w-full p-2 border rounded ${
                errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Check-in *</label>
            <input
              type="date"
              value={formData.checkIn}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, checkIn: e.target.value }));
                if (errors.checkIn) {
                  setErrors(prev => ({ ...prev, checkIn: '' }));
                }
              }}
              className={`w-full p-2 border rounded ${
                errors.checkIn ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.checkIn && (
              <p className="text-red-500 text-sm mt-1">{errors.checkIn}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Check-out *</label>
            <input
              type="date"
              value={formData.checkOut}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, checkOut: e.target.value }));
                if (errors.checkOut) {
                  setErrors(prev => ({ ...prev, checkOut: '' }));
                }
              }}
              className={`w-full p-2 border rounded ${
                errors.checkOut ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              required
            />
            {errors.checkOut && (
              <p className="text-red-500 text-sm mt-1">{errors.checkOut}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Monto *</label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }));
                if (errors.amount) {
                  setErrors(prev => ({ ...prev, amount: '' }));
                }
              }}
              className={`w-full p-2 border rounded ${
                errors.amount ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              min="0"
              step="0.01"
              required
            />
            {errors.amount && (
              <p className="text-red-500 text-sm mt-1">{errors.amount}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value as 'USD' | 'CRC' }))}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="USD">USD</option>
              <option value="CRC">CRC</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Huéspedes</label>
            <input
              type="number"
              value={formData.numberOfGuests}
              onChange={(e) => {
                setFormData(prev => ({ ...prev, numberOfGuests: parseInt(e.target.value) || 1 }));
                if (errors.numberOfGuests) {
                  setErrors(prev => ({ ...prev, numberOfGuests: '' }));
                }
              }}
              className={`w-full p-2 border rounded ${
                errors.numberOfGuests ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              min="1"
              max={cabin.capacity}
              required
            />
            {errors.numberOfGuests && (
              <p className="text-red-500 text-sm mt-1">{errors.numberOfGuests}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Canal de Reserva</label>
            <select
              value={formData.reservationChannel}
              onChange={(e) => setFormData(prev => ({ ...prev, reservationChannel: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccionar...</option>
              {config.reservationChannels.map(channel => (
                <option key={channel} value={channel}>{channel}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado de Pago</label>
            <select
              value={formData.paymentStatus}
              onChange={(e) => setFormData(prev => ({ ...prev, paymentStatus: e.target.value }))}
              className="w-full p-2 border rounded"
            >
              <option value="">Seleccionar...</option>
              {config.paymentStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Comentarios</label>
          <textarea
            value={formData.comments}
            onChange={(e) => setFormData(prev => ({ ...prev, comments: e.target.value }))}
            className="w-full p-2 border rounded h-20 resize-none"
            placeholder="Comentarios adicionales..."
          />
        </div>

        <div className="flex justify-between pt-4">
          <div>
            {booking && (
              <Button
                type="button"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                Eliminar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              type="button" 
              variant="secondary" 
              onClick={() => {
                onClose();
                // Limpiar errores al cerrar
                setErrors({});
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : (booking ? 'Actualizar' : 'Crear')} Reserva
            </Button>
          </div>
        </div>
      </form>

      {showDeleteConfirm && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Confirmar Eliminación"
        >
          <p className="mb-4">
            ¿Está seguro que desea eliminar la reserva de <strong>{booking?.clientName}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
              Cancelar
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </Modal>
      )}
    </Modal>
  );
}