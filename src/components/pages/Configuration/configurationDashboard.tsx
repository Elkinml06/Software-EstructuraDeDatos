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
  };
  car: { 
    min15: number; 
    min30: number; 
    min45: number; 
    hour: number; 
    monthly: number;
    daily: number;
  };
}

const ConfigurationDashboard: FC<ConfigurationProps> = ({ onLogout }) => {
  const [rates, setRates] = useState<ParkingRates>(() => {
    const saved = localStorage.getItem("parkingRates");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Si el JSON está corrupto, usar valores por defecto
      }
    }
    return {
      moto: { min30: 1000, hour: 1300, monthly: 60000, daily: 15000 },
      car: { min15: 1600, min30: 2400, min45: 2800, hour: 3200, monthly: 100000, daily: 25000 },
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
    field: "min15" | "min30" | "min45" | "hour" | "monthly" | "daily",
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
            </div>
          </div>
        </div>
      </main>
    </>
  );
};

export default ConfigurationDashboard;