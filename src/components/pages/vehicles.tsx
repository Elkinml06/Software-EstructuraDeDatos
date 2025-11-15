import { FC } from "react";
import Header from "../common/header";
import Dashboard from "./Vehicles/dashboard";

interface VehiclesProps {
  onLogout: () => void;
}

const Vehicles: FC<VehiclesProps> = ({ onLogout }) => {
  return (
    <>
      <Header onLogout={onLogout} />
      <Dashboard />
    </>
  );
};

export default Vehicles;
