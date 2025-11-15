import { FC } from "react";
import CashDashboard from "./Cash/cashDashboard";

interface CajaDashboardProps {
  dineroEnCaja?: number;
  ingresosDelDia?: number;
  entregadoHoy?: number;
  onLogout: () => void;
}

const CajaDashboard: FC<CajaDashboardProps> = (props) => {
  return <CashDashboard {...props} />;
};

export default CajaDashboard;
