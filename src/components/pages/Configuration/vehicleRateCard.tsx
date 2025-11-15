import { FC } from "react";
import { Bike, Car } from "lucide-react";
import RateInput from "./rateInput";

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

interface VehicleRateCardProps {
  vehicleType: "moto" | "car";
  rates: ParkingRates;
  isEditing: boolean;
  onRateChange: (
    vehicle: "moto" | "car",
    field: "min15" | "min30" | "min45" | "hour" | "monthly" | "daily" | "event",
    value: string
  ) => void;
}

const VehicleRateCard: FC<VehicleRateCardProps> = ({
  vehicleType,
  rates,
  isEditing,
  onRateChange,
}) => {
  const isMoto = vehicleType === "moto";
  const vehicleRates = rates[vehicleType];

  return (
    <div className="rounded-xl p-6 border" style={{ backgroundColor: "var(--color-white)", borderColor: "var(--color-gray-200)" }}>
      <div className="flex items-center gap-3 mb-6">
        {isMoto ? (
          <Bike size={24} style={{ color: "var(--color-blue)" }} />
        ) : (
          <Car size={24} style={{ color: "var(--color-blue)" }} />
        )}
        <h3 className="text-xl font-semibold" style={{ color: "var(--color-text-dark)" }}>{isMoto ? "Moto" : "Carro"}</h3>
      </div>
      
      <div className="space-y-4">
        {!isMoto && (
          <RateInput
            label="15 min"
            value={(vehicleRates as { min15: number }).min15}
            isEditing={isEditing}
            onChange={(value) => onRateChange(vehicleType, "min15", value)}
          />
        )}
        
        <RateInput
          label="30 min"
          value={vehicleRates.min30}
          isEditing={isEditing}
          onChange={(value) => onRateChange(vehicleType, "min30", value)}
        />
        
        {!isMoto && (
          <RateInput
            label="45 min"
            value={(vehicleRates as { min45: number }).min45}
            isEditing={isEditing}
            onChange={(value) => onRateChange(vehicleType, "min45", value)}
          />
        )}
        
        <RateInput
          label="Hora"
          value={vehicleRates.hour}
          isEditing={isEditing}
          onChange={(value) => onRateChange(vehicleType, "hour", value)}
        />
        
        <RateInput
          label="Día"
          value={vehicleRates.daily}
          isEditing={isEditing}
          onChange={(value) => onRateChange(vehicleType, "daily", value)}
        />
        
        <RateInput
          label="Mensualidad"
          value={vehicleRates.monthly}
          isEditing={isEditing}
          onChange={(value) => onRateChange(vehicleType, "monthly", value)}
        />

        <RateInput
          label="Evento (3h)"
          value={vehicleRates.event}
          isEditing={isEditing}
          onChange={(value) => onRateChange(vehicleType, "event", value)}
        />
      </div>
    </div>
  );
};

export default VehicleRateCard;