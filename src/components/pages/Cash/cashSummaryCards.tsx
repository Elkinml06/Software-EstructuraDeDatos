import { FC, useState, useEffect } from "react";
import { DollarSign, ArrowUpRight, ArrowDownRight, Pencil } from "lucide-react";
import { getTodayIncome, formatCurrency } from "./incomeUtils";

interface CashSummaryCardsProps {
  dineroEnCaja: number;
  onEditCash: () => void;
  entregadoHoy: number;
  onWithdrawCash: () => void;
}

const CashSummaryCards: FC<CashSummaryCardsProps> = ({
  dineroEnCaja,
  onEditCash,
  entregadoHoy,
  onWithdrawCash,
}) => {
  const [realTimeIncome, setRealTimeIncome] = useState(0);

  // 🔹 Cargar ingresos reales del día en tiempo real
  useEffect(() => {
    const updateIncome = () => {
      const todayStats = getTodayIncome();
      setRealTimeIncome(todayStats.total);
    };

    // Cargar inicialmente
    updateIncome();

    // Actualizar cada 2 segundos para reflejar cambios en tiempo real
    const interval = setInterval(updateIncome, 2000);

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "incomeRecords") {
        updateIncome();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Dinero en Caja */}
      <div className="bg-white rounded-lg shadow p-4 relative">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Dinero en Caja</span>
          <div className="flex items-center gap-2">
            <DollarSign size={20} className="text-green-500" />
            <Pencil
              size={18}
              className="text-gray-400 hover:text-gray-600 cursor-pointer"
              onClick={onEditCash}
            />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatCurrency(dineroEnCaja)}
        </p>
      </div>

      {/* Ingresos del Día - Datos Reales */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-700 font-medium">Ingresos del Día</span>
          <ArrowUpRight size={20} style={{ color: "var(--color-blue)" }} />
        </div>
        <p className="text-2xl font-bold text-gray-900 mt-2">
          {formatCurrency(realTimeIncome)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          🔄 Actualización automática
        </p>
      </div>

      {/* Entregado Hoy */}
      <div className="bg-white rounded-lg shadow p-4 flex flex-col justify-between">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-700 font-medium">Entregado Hoy</span>
          <ArrowDownRight size={20} className="text-red-500" />
        </div>
        <p className="text-2xl font-bold text-gray-900 mb-3">{formatCurrency(entregadoHoy)}</p>
        <button
          onClick={onWithdrawCash}
          className="w-full py-2 rounded-md transition"
          style={{ backgroundColor: "var(--color-blue)", color: "var(--color-white)" }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-blue-hover)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-blue)"; }}
        >
          Entregar dinero
        </button>
      </div>
    </div>
  );
};

export default CashSummaryCards;