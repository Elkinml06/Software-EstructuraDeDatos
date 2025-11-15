import { FC, useState, useEffect } from "react";
import { Calendar, AlertTriangle, CheckCircle, Clock } from "lucide-react";

// Interfaz para el registro de vehículos (desde access.tsx)
interface VehicleRegistry {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthlyExpiryDate?: string;
}

const MonthlyManagement: FC = () => {
  const [vehicleRegistry, setVehicleRegistry] = useState<VehicleRegistry[]>([]);
  // Vista solo lectura: sin edición

  // Cargar vehicleRegistry desde localStorage
  useEffect(() => {
    const loadData = () => {
      const savedRegistry = localStorage.getItem("vehicleRegistry");
      if (savedRegistry) {
        setVehicleRegistry(JSON.parse(savedRegistry));
      }
    };

    loadData();
    
    // 🔹 ELIMINADO: setInterval que causaba bloqueo de entrada
    // El interval constante interfería con el estado de los formularios
    // Los datos se cargan una vez y se actualizan mediante eventos de storage
    
    // Escuchar cambios en localStorage para sincronización automática
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vehicleRegistry") {
        loadData();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    // Escuchar eventos internos de sincronización (mismo window)
    const handleRegistryUpdated = () => loadData();
    window.addEventListener("registryUpdated", handleRegistryUpdated as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("registryUpdated", handleRegistryUpdated as EventListener);
    };
  }, []);

  // Filtrar solo vehículos con mensualidad (vigente o vencida)
  const monthlyVehicles = vehicleRegistry.filter(vehicle => vehicle.monthlyExpiryDate);

  // Vista solo lectura: sin edición ni acciones

  // Función para calcular días restantes
  const getDaysUntilExpiry = (expiryDate: string | undefined): number => {
    if (!expiryDate) return 0;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Función para obtener el estado de vencimiento
  const getExpiryStatus = (expiryDate: string | undefined) => {
    if (!expiryDate) return { status: 'unknown', color: 'gray', text: 'Sin fecha' };
    
    const daysLeft = getDaysUntilExpiry(expiryDate);
    
    if (daysLeft < 0) {
      return { status: 'expired', color: 'red', text: `Vencido hace ${Math.abs(daysLeft)} días` };
    } else if (daysLeft <= 3) {
      return { status: 'expiring', color: 'yellow', text: `Vence en ${daysLeft} días` };
    } else if (daysLeft <= 7) {
      return { status: 'warning', color: 'orange', text: `Vence en ${daysLeft} días` };
    } else {
      return { status: 'active', color: 'green', text: `Vence en ${daysLeft} días` };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900" >
          Gestión de Clientes Mensuales
        </h2>
        <div className="text-sm text-gray-500">
          Total mensuales: {monthlyVehicles.length}
        </div>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {(() => {
          const expired = monthlyVehicles.filter(v => getDaysUntilExpiry(v.monthlyExpiryDate) < 0).length;
          const expiring = monthlyVehicles.filter(v => {
            const days = getDaysUntilExpiry(v.monthlyExpiryDate);
            return days >= 0 && days <= 3;
          }).length;
          const warning = monthlyVehicles.filter(v => {
            const days = getDaysUntilExpiry(v.monthlyExpiryDate);
            return days > 3 && days <= 7;
          }).length;
          const active = monthlyVehicles.filter(v => getDaysUntilExpiry(v.monthlyExpiryDate) > 7).length;

          return (
            <>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <AlertTriangle className="h-5 w-5 text-red-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Vencidos</p>
                    <p className="text-2xl font-bold text-red-900">{expired}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Por vencer (≤3 días)</p>
                    <p className="text-2xl font-bold text-yellow-900">{expiring}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-orange-800">Alerta (4-7 días)</p>
                    <p className="text-2xl font-bold text-orange-900">{warning}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Activos</p>
                    <p className="text-2xl font-bold text-green-900">{active}</p>
                  </div>
                </div>
              </div>
            </>
          );
        })()}
      </div>

      {/* Lista de clientes mensuales */}
      {monthlyVehicles.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-2" />
          <p>No hay clientes mensuales registrados</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Placa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marca
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha de Vencimiento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                {/* Sin acciones en vista solo lectura */}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {monthlyVehicles
                .sort((a, b) => getDaysUntilExpiry(a.monthlyExpiryDate) - getDaysUntilExpiry(b.monthlyExpiryDate))
                .map((vehicle) => {
                  const expiryStatus = getExpiryStatus(vehicle.monthlyExpiryDate);
                  
                  return (
                    <tr key={vehicle.plate} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{vehicle.plate}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 capitalize">{vehicle.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{vehicle.brand}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {vehicle.monthlyExpiryDate 
                            ? new Date(vehicle.monthlyExpiryDate).toLocaleDateString('es-CO')
                            : 'Sin fecha'
                          }
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          expiryStatus.color === 'red' ? 'bg-red-100 text-red-800' :
                          expiryStatus.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                          expiryStatus.color === 'orange' ? 'bg-orange-100 text-orange-800' :
                          expiryStatus.color === 'green' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {expiryStatus.text}
                        </span>
                      </td>
                      {/* Sin acciones en modo solo lectura */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium"></td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonthlyManagement;