import { FC, useEffect, useState } from "react";
import PlatesList from "./platesList";
import MonthlyManagement from "./monthlyManagement";

// Interfaz para el registro de vehículos (desde access.tsx)
interface VehicleRegistry {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthlyExpiryDate?: string;
}

// Interfaz para compatibilidad con vehicles.tsx
interface Vehicle {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthly: boolean;
  status: "dentro" | "fuera";
  entryTime: string | null;
  exitTime: string | null;
  price: number;
  monthlyStartDate?: string;
  monthlyEndDate?: string;
  ownerName?: string;
  ownerPhone?: string;
}

const Dashboard: FC = () => {
  const [vehicleRegistry, setVehicleRegistry] = useState<VehicleRegistry[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Cargar datos desde localStorage con sincronización automática
  useEffect(() => {
    const loadData = () => {
      // Cargar registro de vehículos (desde access.tsx)
      const savedRegistry = localStorage.getItem("vehicleRegistry");
      if (savedRegistry) {
        setVehicleRegistry(JSON.parse(savedRegistry));
      }

      // Mantener compatibilidad con vehicles.tsx
      const savedVehicles = localStorage.getItem("parkingVehicles");
      if (savedVehicles) {
        setVehicles(JSON.parse(savedVehicles));
      }
    };

    loadData();

    // Escuchar cambios en localStorage para sincronización automática
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vehicleRegistry" || e.key === "parkingVehicles") {
        loadData();
      }
    };

    // Escuchar evento personalizado emitido por platesList.tsx para actualización inmediata en misma pestaña
    const onRegistryUpdated = () => {
      loadData();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("registryUpdated", onRegistryUpdated);

    // 🔹 ELIMINADO: setInterval que causaba bloqueo de entrada
    // El interval constante interfería con el estado de los formularios
    // La sincronización ahora se maneja solo por eventos de storage

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("registryUpdated", onRegistryUpdated);
    };
  }, []);

  // Función para actualizar un vehículo con sincronización completa
  const handleUpdateVehicle = (updatedVehicle: Vehicle) => {
    // 🔹 SINCRONIZACIÓN COMPLETA: Actualizar todos los sistemas de datos
    
    // 1. Actualizar parkingVehicles (sistema local del dashboard)
    const updatedVehicles = vehicles.map(vehicle => 
      vehicle.plate === updatedVehicle.plate ? updatedVehicle : vehicle
    );
    setVehicles(updatedVehicles);
    localStorage.setItem("parkingVehicles", JSON.stringify(updatedVehicles));
    
    // 2. Actualizar vehicleRegistry si el vehículo existe allí
    const savedRegistry = localStorage.getItem("vehicleRegistry");
    if (savedRegistry) {
      const registry = JSON.parse(savedRegistry);
      const updatedRegistry = registry.map((v: VehicleRegistry) => {
        if (v.plate === updatedVehicle.plate) {
          return {
            ...v,
            plate: updatedVehicle.plate,
            type: updatedVehicle.type,
            brand: updatedVehicle.brand
          };
        }
        return v;
      });
      
      localStorage.setItem("vehicleRegistry", JSON.stringify(updatedRegistry));
      setVehicleRegistry(updatedRegistry);
    }
    
    // 3. Actualizar activeVehicles si el vehículo está activo
    const savedActiveVehicles = localStorage.getItem("activeVehicles");
    if (savedActiveVehicles) {
      const activeVehicles = JSON.parse(savedActiveVehicles);
      const updatedActiveVehicles = activeVehicles.map((v: Vehicle) => {
        if (v.plate === updatedVehicle.plate) {
          return {
            ...v,
            plate: updatedVehicle.plate,
            type: updatedVehicle.type,
            brand: updatedVehicle.brand
          };
        }
        return v;
      });
      
      localStorage.setItem("activeVehicles", JSON.stringify(updatedActiveVehicles));
    }
    
    // 4. Disparar evento de storage para sincronización entre pestañas
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'parkingVehicles',
      newValue: JSON.stringify(updatedVehicles),
      oldValue: localStorage.getItem("parkingVehicles")
    }));
  };

  // Calcular estadísticas basadas en vehicleRegistry (datos reales de access.tsx)
  const totalPlates = vehicleRegistry.length;
  const monthlyClients = vehicleRegistry.filter(v => {
    if (!v.monthlyExpiryDate) return false;
    const expiryDate = new Date(v.monthlyExpiryDate);
    return expiryDate > new Date(); // Solo contar mensuales vigentes
  }).length;

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 style={{ marginTop: 63.2,color: "var(--color-black)" }}  className="text-4xl font-semibold text-gray-900 mb-2" >
            Gestión de Vehículos
          </h1>
          <p className="text-gray-600 mb-8">
            Administra la información de todos los vehículos registrados en el sistema
          </p>
        </div>

        {/* Estadísticas simplificadas - Solo Total de placas y Total de mensuales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: "var(--color-blue)" }}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide" >
                  Total de Placas
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2" style={{ color: "var(--color-black)" }}>
                  {totalPlates}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: "var(--color-blue)" }}>
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Total de Mensuales
                </p>
                <p className="text-3xl font-bold text-gray-900 mt-2" style={{ color: "var(--color-black)" }}>
                  {monthlyClients}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de todas las placas con búsqueda integrada */}
        <div className="mb-8">
          <PlatesList 
            vehicles={vehicles}
            onUpdateVehicle={(updatedVehicle) => handleUpdateVehicle({ ...updatedVehicle, monthly: false, status: "fuera", entryTime: null, exitTime: null, price: 0 })}
          />
        </div>
        {/* Gestión de mensuales */}
        <div className="mb-8">
          <MonthlyManagement />
        </div>

        
      </div>
    </section>
  );
};

export default Dashboard;