import { FC, useState, useEffect, useRef } from "react";
import { Edit2, Save, X, Search, Trash } from "lucide-react";

// Interfaz para el registro de vehículos (desde access.tsx)
interface VehicleRegistry {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthlyExpiryDate?: string;
}

interface PlatesListProps {
  // Props retenidos por compatibilidad con dashboard, no necesarios aquí
  vehicles?: Array<{ plate: string; type: "carro" | "moto"; brand: string }>;
  onUpdateVehicle?: (updatedVehicle: { plate: string; type: "carro" | "moto"; brand: string }) => void;
}

const PlatesList: FC<PlatesListProps> = () => {
  
  // Estados para la funcionalidad de búsqueda
  const [vehicleRegistry, setVehicleRegistry] = useState<VehicleRegistry[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [editingRegistryPlate, setEditingRegistryPlate] = useState<string | null>(null);
  const [editRegistryForm, setEditRegistryForm] = useState<VehicleRegistry | null>(null);
  const [deletingPlate, setDeletingPlate] = useState<string | null>(null);
  const [deleteKey, setDeleteKey] = useState<string>("");
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Tipos y helpers para sincronizar pagos diarios
  interface DailyPaymentRecord {
    plate: string;
    type: "carro" | "moto";
    brand: string;
    dateKey: string; // YYYY-MM-DD
    createdAt: string;
  }

  const getDateKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Cargar vehicleRegistry desde localStorage (solo una vez)
  useEffect(() => {
    const savedRegistry = localStorage.getItem("vehicleRegistry");
    if (savedRegistry) {
      setVehicleRegistry(JSON.parse(savedRegistry));
    }
  }, []);

  // Buscar y desplazarse al elemento dentro de la lista
  const handleSearch = () => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return;
    const target = vehicleRegistry.find(v => v.plate.toUpperCase().includes(term));
    if (target && itemRefs.current[target.plate]) {
      itemRefs.current[target.plate]?.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      showFeedback('info', 'No se encontró ningún vehículo con esa placa');
    }
  };

  const handleEditRegistry = (vehicle: VehicleRegistry) => {
    setEditRegistryForm({ ...vehicle });
    setEditingRegistryPlate(vehicle.plate);
  };

  const handleSaveRegistry = () => {
    if (!editRegistryForm || !editingRegistryPlate) return;

    const existing = vehicleRegistry.find(v => v.plate === editingRegistryPlate);
    const updatedEntry: VehicleRegistry = {
      plate: editRegistryForm.plate.toUpperCase(),
      type: editRegistryForm.type,
      brand: editRegistryForm.brand,
      monthlyExpiryDate: existing?.monthlyExpiryDate,
    };

    let updatedRegistry: VehicleRegistry[];
    if (editingRegistryPlate !== updatedEntry.plate) {
      updatedRegistry = vehicleRegistry.filter(v => v.plate !== editingRegistryPlate);
      updatedRegistry.push(updatedEntry);
    } else {
      updatedRegistry = vehicleRegistry.map(v => (v.plate === editingRegistryPlate ? updatedEntry : v));
    }
    setVehicleRegistry(updatedRegistry);
    localStorage.setItem("vehicleRegistry", JSON.stringify(updatedRegistry));
    // Notificar a otros componentes que el registro cambió (mismo ventana)
    window.dispatchEvent(new Event('registryUpdated'));

    // Sincronizar activeVehicles
    const savedActive = localStorage.getItem("activeVehicles");
    if (savedActive) {
      const activeVehicles = JSON.parse(savedActive) as Array<{ plate: string; type: string; brand: string }>;
      const updatedActive = activeVehicles.map(v => (v.plate === editingRegistryPlate ? { ...v, plate: updatedEntry.plate, type: updatedEntry.type, brand: updatedEntry.brand } : v));
      localStorage.setItem("activeVehicles", JSON.stringify(updatedActive));
    }

    // Sincronizar parkingVehicles
    const savedParking = localStorage.getItem("parkingVehicles");
    if (savedParking) {
      const parkingVehicles = JSON.parse(savedParking) as Array<{ plate: string; type: string; brand: string }>;
      const updatedParking = parkingVehicles.map(v => (v.plate === editingRegistryPlate ? { ...v, plate: updatedEntry.plate, type: updatedEntry.type, brand: updatedEntry.brand } : v));
      localStorage.setItem("parkingVehicles", JSON.stringify(updatedParking));
    }

    // Sincronizar incomeRecords
    const savedIncome = localStorage.getItem("incomeRecords");
    if (savedIncome) {
      const incomeRecords = JSON.parse(savedIncome) as Array<{ plate: string; vehicleType?: string; brand?: string }>;
      const updatedIncome = incomeRecords.map(r => (r.plate === editingRegistryPlate ? { ...r, plate: updatedEntry.plate, vehicleType: updatedEntry.type, brand: updatedEntry.brand } : r));
      localStorage.setItem("incomeRecords", JSON.stringify(updatedIncome));
    }

    setEditingRegistryPlate(null);
    setEditRegistryForm(null);
    showFeedback('success', 'Datos actualizados correctamente');
  };

  const handleCancelRegistry = () => {
    setEditRegistryForm(null);
    setEditingRegistryPlate(null);
  };

  

  const sortedRegistry = [...vehicleRegistry].sort((a, b) => a.plate.localeCompare(b.plate));

  const startDeleteRegistry = (vehicle: VehicleRegistry) => {
    setDeletingPlate(vehicle.plate);
    setDeleteKey("");
  };

  const cancelDeleteRegistry = () => {
    setDeletingPlate(null);
    setDeleteKey("");
  };

  const confirmDeleteRegistry = (vehicle: VehicleRegistry) => {
    if (deleteKey !== "1234") { // misma clave que el login
      showFeedback('error', 'Clave incorrecta');
      return;
    }

    const updatedRegistry = vehicleRegistry.filter(v => v.plate !== vehicle.plate);
    setVehicleRegistry(updatedRegistry);
    localStorage.setItem("vehicleRegistry", JSON.stringify(updatedRegistry));
    // Notificar a otros componentes que el registro cambió (mismo ventana)
    window.dispatchEvent(new Event('registryUpdated'));

    // Eliminar pagos diarios vigentes para hoy de esta placa
    const savedDaily = localStorage.getItem("dailyPayments");
    if (savedDaily) {
      try {
        const daily = JSON.parse(savedDaily) as DailyPaymentRecord[];
        const todayKey = getDateKey();
        const updatedDaily = daily.filter(p => !(p.plate === vehicle.plate && p.dateKey === todayKey));
        localStorage.setItem("dailyPayments", JSON.stringify(updatedDaily));
      } catch (err) {
        // Si hay error, limpiar por seguridad las entradas de hoy para esa placa
        const fallback: DailyPaymentRecord[] = [];
        localStorage.setItem("dailyPayments", JSON.stringify(fallback));
      }
    }

    const savedActive = localStorage.getItem("activeVehicles");
    if (savedActive) {
      const activeVehicles = JSON.parse(savedActive) as Array<{ plate: string; type: string; brand: string }>;
      const updatedActive = activeVehicles.filter(v => v.plate !== vehicle.plate);
      localStorage.setItem("activeVehicles", JSON.stringify(updatedActive));
    }
    const savedParking = localStorage.getItem("parkingVehicles");
    if (savedParking) {
      const parkingVehicles = JSON.parse(savedParking) as Array<{ plate: string; type: string; brand: string }>;
      const updatedParking = parkingVehicles.filter(v => v.plate !== vehicle.plate);
    localStorage.setItem("parkingVehicles", JSON.stringify(updatedParking));
    }

    setDeletingPlate(null);
    setDeleteKey("");
    showFeedback('success', 'Vehículo eliminado del registro');
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900" style={{ color: "var(--color-black)" }}>
          Gestión de Placas Registradas
        </h2>
        <div className="text-sm text-gray-500">Total: {vehicleRegistry.length} vehículos</div>
      </div>

      {feedback && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800' :
          feedback.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Sección única: búsqueda y lista completa del registro */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex gap-2 mb-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Ingresa la placa y presiona Enter..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="w-full pl-10 pr-4 py-2 border rounded-lg font-medium transition-colors"
              style={{ backgroundColor: "var(--color-gray-50)", borderColor: "var(--color-gray-200)", color: "var(--color-black)", outline: "none" }}
              onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--color-blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-blue-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--color-gray-200)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5" style={{ color: "var(--color-blue)" }} />
          </div>
          <button onClick={handleSearch} style={{ backgroundColor: "var(--color-dark-blue)", color: "#ffffff" }} className="px-6 py-2 rounded-lg transition-colors">Buscar</button>
        </div>

        <h3 className="text-lg font-medium text-gray-900 mb-4">Lista Completa de Vehículos</h3>
        {sortedRegistry.length === 0 ? (
          <div className="text-center py-6 text-gray-500">No hay registros de placas</div>
        ) : (
          <div className="space-y-3 max-h-[60vh] overflow-auto">
            {sortedRegistry.map((v) => {
              const isEditing = editingRegistryPlate === v.plate;
              return (
                <div key={v.plate} ref={(el) => (itemRefs.current[v.plate] = el)} className="border border-gray-200 rounded-lg p-4 bg-white">
                  {isEditing ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
                        <input
                          type="text"
                          value={editRegistryForm?.plate || ''}
                          onChange={(e) => setEditRegistryForm(prev => prev ? { ...prev, plate: e.target.value.toUpperCase() } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                        <select
                          value={editRegistryForm?.type || ''}
                          onChange={(e) => setEditRegistryForm(prev => prev ? { ...prev, type: e.target.value as "carro" | "moto" } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="carro">Carro</option>
                          <option value="moto">Moto</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <input
                          type="text"
                          value={editRegistryForm?.brand || ''}
                          onChange={(e) => setEditRegistryForm(prev => prev ? { ...prev, brand: e.target.value } : null)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div className="col-span-1 md:col-span-3 flex gap-2 pt-2">
                        <button onClick={handleSaveRegistry} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"><Save className="h-4 w-4" /> Guardar Cambios</button>
                        <button onClick={handleCancelRegistry} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"><X className="h-4 w-4" /> Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Placa</label>
                          <p className="text-lg font-semibold text-gray-900">{v.plate}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Tipo</label>
                          <p className="text-lg text-gray-900 capitalize">{v.type}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-500">Marca</label>
                          <p className="text-lg text-gray-900">{v.brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <button onClick={() => handleEditRegistry(v)} style={{ color: "var(--color-dark-blue)" }} className="flex items-center gap-2 px-3 py-1 hover:bg-blue-50 rounded-md transition-colors"><Edit2 className="h-4 w-4" /> Editar</button>
                        {deletingPlate === v.plate ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="password"
                              placeholder="Clave"
                              value={deleteKey}
                              onChange={(e) => setDeleteKey(e.target.value)}
                              className="px-2 py-1 border border-red-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            <button onClick={() => confirmDeleteRegistry(v)} className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">Confirmar</button>
                            <button onClick={cancelDeleteRegistry} className="px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">Cancelar</button>
                          </div>
                        ) : (
                          <button onClick={() => startDeleteRegistry(v)} className="flex items-center gap-2 px-3 py-1 text-red-600 hover:bg-red-50 rounded-md transition-colors"><Trash className="h-4 w-4" /> Eliminar</button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlatesList;