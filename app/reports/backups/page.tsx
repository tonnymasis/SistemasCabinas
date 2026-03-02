'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Backup {
  name: string;
  type: string;
  date: string;
  size: number;
}

export default function BackupsPage() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = async () => {
    try {
      const response = await fetch('/api/backups');
      const data = response.ok ? await response.json() : [];
      setBackups(data);
    } catch (error) {
      console.error('Error loading backups:', error);
    } finally {
      setLoading(false);
    }
  };

  const createBackup = async (type: 'daily' | 'weekly' | 'monthly') => {
    setProcessing(type);
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', type })
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Backup ${type} creado exitosamente`);
        await loadBackups();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error creando backup');
      console.error('Error:', error);
    } finally {
      setProcessing(null);
    }
  };

  const restoreBackup = async (backupFileName: string) => {
    if (!confirm(`¿Estás seguro de restaurar desde el backup "${backupFileName}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    setProcessing(backupFileName);
    try {
      const response = await fetch('/api/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'restore', backupFileName })
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Datos restaurados exitosamente. Recarga la página para ver los cambios.');
        window.location.reload();
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      alert('Error restaurando backup');
      console.error('Error:', error);
    } finally {
      setProcessing(null);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      transactional: '⚡ Transaccional',
      daily: '📅 Diario', 
      weekly: '📊 Semanal',
      monthly: '📆 Mensual'
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      transactional: 'bg-gray-100 text-gray-800',
      daily: 'bg-blue-100 text-blue-800',
      weekly: 'bg-green-100 text-green-800',
      monthly: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="text-gray-500 text-lg">Cargando sistema de backups...</div>
          </div>
        </div>
      </div>
    );
  }

  const backupsByType = backups.reduce((acc, backup) => {
    if (!acc[backup.type]) acc[backup.type] = [];
    acc[backup.type].push(backup);
    return acc;
  }, {} as Record<string, Backup[]>);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <Link href="/" className="text-blue-600 hover:underline mb-2 inline-block">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Sistema de Backups
          </h1>
          <p className="text-gray-600">
            Gestión y restauración de copias de seguridad
          </p>
        </header>

        {/* Acciones Rápidas */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Crear Backup Manual</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => createBackup('daily')}
              disabled={processing === 'daily'}
              className="flex items-center justify-center p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📅</div>
                <div className="font-semibold text-blue-800">Backup Diario</div>
                <div className="text-sm text-gray-600">Copia de seguridad diaria</div>
              </div>
            </button>

            <button
              onClick={() => createBackup('weekly')}
              disabled={processing === 'weekly'}
              className="flex items-center justify-center p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold text-green-800">Backup Semanal</div>
                <div className="text-sm text-gray-600">Copia de seguridad semanal</div>
              </div>
            </button>

            <button
              onClick={() => createBackup('monthly')}
              disabled={processing === 'monthly'}
              className="flex items-center justify-center p-4 border-2 border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-center">
                <div className="text-2xl mb-2">📆</div>
                <div className="font-semibold text-purple-800">Backup Mensual</div>
                <div className="text-sm text-gray-600">Copia de seguridad mensual</div>
              </div>
            </button>
          </div>
        </div>

        {/* Estado de Backups */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-gray-600 text-xl">⚡</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-800">
                  {backupsByType.transactional?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Transaccionales</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-800">
                  {backupsByType.daily?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Diarios</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-800">
                  {backupsByType.weekly?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Semanales</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                <span className="text-purple-600 text-xl">📆</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-800">
                  {backupsByType.monthly?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Mensuales</div>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Backups */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              Historial de Backups ({backups.length})
            </h2>
          </div>
          
          {backups.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Archivo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha/Hora</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tamaño</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {backups.slice(0, 50).map((backup) => (
                    <tr key={backup.name} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-mono text-sm text-gray-900">{backup.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(backup.type)}`}>
                          {getTypeLabel(backup.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatDate(backup.date)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {formatFileSize(backup.size)}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => restoreBackup(backup.name)}
                          disabled={processing === backup.name}
                          className="bg-blue-600 hoverbg-blue-700 text-white px-3 py-1 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {processing === backup.name ? 'Restaurando...' : 'Restaurar'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="text-gray-400 text-6xl mb-4">📁</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay backups disponibles</h3>
              <p className="text-gray-600">Los backups se crean automáticamente o puedes crear uno manual.</p>
            </div>
          )}
        </div>

        {/* Información del Sistema */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">ℹ️ Información del Sistema de Backup</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-700">
            <div>
              <h4 className="font-semibold mb-2">Backup Automático:</h4>
              <ul className="space-y-1">
                <li>• Se crea backup en cada cambio de datos</li>
                <li>• Se mantienen máximo 50 backups transaccionales</li>
                <li>• Limpieza automática de archivos antiguos</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Retención de Backups:</h4>
              <ul className="space-y-1">
                <li>• <strong>Diarios:</strong> 30 días</li>
                <li>• <strong>Semanales:</strong> 12 semanas (3 meses)</li>
                <li>• <strong>Mensuales:</strong> 12 meses (1 año)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}