import { FC, useState, useEffect } from "react";
import Header from "../../common/header";
import ConfigurationHeader from "./configurationHeader";
import VehicleRateCard from "./vehicleRateCard";

interface ConfigurationProps {
  onLogout: () => void;
}

interface ParkingRates {
  moto: { 
    min30: number; 
    hour: number; 
    monthly: number;
    daily: number;
    event: number;
  };
  car: { 
    min15: number; 
    min30: number; 
    min45: number; 
    hour: number; 
    monthly: number;
    daily: number;
    event: number;
  };
}

const ConfigurationDashboard: FC<ConfigurationProps> = ({ onLogout }) => {
  const [rates, setRates] = useState<ParkingRates>(() => {
    const saved = localStorage.getItem("parkingRates");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          moto: { min30: parsed.moto.min30, hour: parsed.moto.hour, monthly: parsed.moto.monthly, daily: parsed.moto.daily, event: parsed.moto.event ?? 3000 },
          car: { min15: parsed.car.min15, min30: parsed.car.min30, min45: parsed.car.min45, hour: parsed.car.hour, monthly: parsed.car.monthly, daily: parsed.car.daily, event: parsed.car.event ?? 8000 },
        };
      } catch (e) {
        // Si el JSON está corrupto, usar valores por defecto
      }
    }
    return {
      moto: { min30: 1000, hour: 1300, monthly: 60000, daily: 15000, event: 3000 },
      car: { min15: 1600, min30: 2400, min45: 2800, hour: 3200, monthly: 100000, daily: 25000, event: 8000 },
    };
  });

  const [isEditing, setIsEditing] = useState(false);

  // Escuchar cambios en localStorage (por ediciones en otras ventanas)
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "parkingRates" && e.newValue) {
        try {
          setRates(JSON.parse(e.newValue));
        } catch (err) { /* empty */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // Guardar configuración cuando cambie
  useEffect(() => {
    localStorage.setItem("parkingRates", JSON.stringify(rates));
  }, [rates]);

  const handleRateChange = (
    vehicle: "moto" | "car",
    field: "min15" | "min30" | "min45" | "hour" | "monthly" | "daily" | "event",
    value: string
  ) => {
    // Convertir el valor a número, permitir 0 como valor válido
    const numValue = value === "" ? 0 : Math.max(0, parseInt(value) || 0);
    
    setRates((prev) => ({
      ...prev,
      [vehicle]: { ...prev[vehicle], [field]: numValue },
    }));
  };

  const toggleEdit = () => {
    setIsEditing((prev) => !prev);
  };

  const [eventActiveToday, setEventActiveToday] = useState(false);

  const getDateKey = (d = new Date()) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    const key = localStorage.getItem("eventActiveDateKey");
    setEventActiveToday(key === getDateKey());
  }, []);

  const toggleEventActive = () => {
    setEventActiveToday((prev) => {
      const next = !prev;
      localStorage.setItem("eventActiveDateKey", next ? getDateKey() : "");
      return next;
    });
  };

  return (
    <>
      <Header onLogout={onLogout} />
      <main className="min-h-screen p-6" style={{ backgroundColor: "var(--color-white)" }}>
        <div style={{ marginTop: 63.2 }}>
          <div className="max-w-4xl mx-auto">
            <ConfigurationHeader isEditing={isEditing} onToggleEdit={toggleEdit} />

            <div
              className="shadow-md rounded-2xl p-8 border"
              style={{
                backgroundColor: "var(--color-white)",
                borderColor: "var(--color-gray-200)",
              }}
            >
              <h2
                className="text-2xl font-extrabold mb-6" 
                style={{ color: "var(--color-blue)" }}
              >
                Tarifas
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <VehicleRateCard
                  vehicleType="moto"
                  rates={rates}
                  isEditing={isEditing}
                  onRateChange={handleRateChange}
                />
                
              <VehicleRateCard
                vehicleType="car"
                rates={rates}
                isEditing={isEditing}
                onRateChange={handleRateChange}
              />
            </div>
            <div className="mt-6 p-4 rounded-lg border" style={{ borderColor: "var(--color-gray-200)", backgroundColor: "var(--color-gray-50)" }}>
              <p className="text-sm" style={{ color: "var(--color-text-dark)" }}>
                En Registro, escriba <span className="font-semibold">0101</span> para reimprimir la última factura.
              </p>
            </div>
            <div className="mt-6 p-4 rounded-lg border flex items-center justify-between" style={{ borderColor: "var(--color-gray-200)" }}>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--color-text-dark)" }}>Día especial / Evento activo hoy</p>
                <p className="text-xs" style={{ color: "var(--color-text-secondary)" }}>Habilita la tarifa fija de 3 horas para hoy</p>
              </div>
              <label className="inline-flex items-center gap-2">
                <input type="checkbox" checked={eventActiveToday} onChange={toggleEventActive} className="h-4 w-4" />
                <span className="text-sm" style={{ color: "var(--color-text-dark)" }}>{eventActiveToday ? "Activo" : "Inactivo"}</span>
              </label>
            </div>
          </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ConfigurationDashboard;