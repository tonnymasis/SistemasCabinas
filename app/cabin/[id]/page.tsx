import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            Gestión de Cabañas Cahuita
          </h1>
          <p className="text-gray-600">
            Sistema de reservas para cabañas en Cahuita, Costa Rica
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Link href="/cabin/bungalow-1">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Calendarios por Cabaña</h2>
              <p className="text-gray-600 mb-4">
                Ver disponibilidad mensual de cada cabaña individual
              </p>
              <Button>Ver Calendarios</Button>
            </div>
          </Link>

          <Link href="/reports">
            <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <h2 className="text-xl font-semibold mb-2">Reporte General</h2>
              <p className="text-gray-600 mb-4">
                Vista consolidada de todas las cabañas para el mes actual
              </p>
              <Button>Ver Reporte</Button>
            </div>
          </Link>
        </div>

        <div className="mt-12 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Cabañas Disponibles</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { id: 'bungalow-1', name: 'Bungalow 1', capacity: 4 },
              { id: 'bungalow-2', name: 'Bungalow 2', capacity: 4 },
              { id: 'bungalow-3', name: 'Bungalow 3', capacity: 6 },
              { id: 'casa-ache', name: 'Casa Aché', capacity: 8 },
              { id: 'cozy-house', name: 'Cozy House', capacity: 2 }
            ].map(cabin => (
              <Link key={cabin.id} href={`/cabin/${cabin.id}`}>
                <div className="border rounded-lg p-4 text-center hover:bg-gray-50 transition-colors">
                  <h4 className="font-medium">{cabin.name}</h4>
                  <p className="text-sm text-gray-600">{cabin.capacity} personas</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}