import { FC, useState, useEffect } from "react";
import { getTodayIncome, getWeekIncome, getMonthIncome, getYearIncome, getIncomeRecords, formatCurrency, IncomeStats, IncomeRecord } from "./incomeUtils";
import { getWithdrawals, CashWithdrawal } from "./cashUtils";

interface MovementHistoryProps {
  filtroActivo: string;
  onFiltroChange: (filtro: string) => void;
}

const MovementHistory: FC<MovementHistoryProps> = ({
  filtroActivo,
  onFiltroChange,
}) => {
  const [incomeStats, setIncomeStats] = useState<IncomeStats>({
    total: 0,
    count: 0,
    byPaymentType: { mensual: 0, diario: 0, por_tiempo: 0, evento: 0 },
    byVehicleType: { carro: 0, moto: 0 }
  });
  const [recentTransactions, setRecentTransactions] = useState<IncomeRecord[]>([]);
  const [recentWithdrawals, setRecentWithdrawals] = useState<CashWithdrawal[]>([]);


  // 🔹 Actualizar estadísticas según el filtro activo
  useEffect(() => {
    const updateStats = () => {
      let stats: IncomeStats;
      
      switch (filtroActivo) {
        case "Día":
          stats = getTodayIncome();
          break;
        case "Semana":
          stats = getWeekIncome();
          break;
        case "Mes":
          stats = getMonthIncome();
          break;
        case "Año":
          stats = getYearIncome();
          break;
        default:
          stats = getTodayIncome();
      }
      
      setIncomeStats(stats);

      // Obtener transacciones recientes para mostrar
      const allRecords = getIncomeRecords();
      const recent = allRecords
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10); // Últimas 10 transacciones
      
      setRecentTransactions(recent);

      // Obtener retiros recientes por período
      const allWithdrawals = getWithdrawals();
      const filteredWithdrawals = filterWithdrawalsByPeriod(allWithdrawals, filtroActivo)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);
      setRecentWithdrawals(filteredWithdrawals);
    };

    updateStats();

    // Actualizar cada 3 segundos
    const interval = setInterval(updateStats, 3000);

    // Escuchar cambios en localStorage
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "incomeRecords" || e.key === "cashWithdrawals") {
        updateStats();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [filtroActivo]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium text-gray-900">
          Historial de Ingresos
        </h2>
        {/* Filtros de tiempo */}
        <div className="flex gap-2">
          {["Día", "Semana", "Mes", "Año"].map((filtro) => (
            <button
              key={filtro}
              onClick={() => onFiltroChange(filtro)}
              className="px-3 py-1 rounded-md text-sm font-medium transition"
              style={{
                backgroundColor: filtroActivo === filtro ? "var(--color-blue)" : "var(--color-gray-100)",
                color: filtroActivo === filtro ? "var(--color-white)" : "var(--color-black)",
                border: "1px solid var(--color-gray-200)",
              }}
              onMouseEnter={(e) => {
                if (filtroActivo !== filtro) e.currentTarget.style.backgroundColor = "var(--color-gray-200)";
              }}
              onMouseLeave={(e) => {
                if (filtroActivo !== filtro) e.currentTarget.style.backgroundColor = "var(--color-gray-100)";
              }}
            >
              {filtro}
            </button>
          ))}
        </div>
      </div>

      {/* Estadísticas del período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-3 rounded-lg" style={{ backgroundColor: "var(--color-blue-soft)" }}>
          <h3 className="text-sm font-medium" style={{ color: "var(--color-blue)" }}>Total del {filtroActivo}</h3>
          <p className="text-xl font-bold" style={{ color: "var(--color-blue)" }}>{formatCurrency(incomeStats.total)}</p>
          <p className="text-xs" style={{ color: "var(--color-blue)" }}>{incomeStats.count} transacciones</p>
        </div>
        
        <div className="bg-green-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Por Carros</h3>
          <p className="text-lg font-bold text-green-900">{formatCurrency(incomeStats.byVehicleType.carro)}</p>
        </div>
        
        <div className="bg-purple-50 p-3 rounded-lg">
          <h3 className="text-sm font-medium text-purple-800">Por Motos</h3>
          <p className="text-lg font-bold text-purple-900">{formatCurrency(incomeStats.byVehicleType.moto)}</p>
        </div>
      </div>

      {/* Desglose por tipo de pago */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Desglose por Tipo de Pago</h3>
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-xs text-gray-600">Mensual</p>
            <p className="font-semibold">{formatCurrency(incomeStats.byPaymentType.mensual)}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-xs text-gray-600">Diario</p>
            <p className="font-semibold">{formatCurrency(incomeStats.byPaymentType.diario)}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-xs text-gray-600">Por Tiempo</p>
            <p className="font-semibold">{formatCurrency(incomeStats.byPaymentType.por_tiempo)}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded text-center">
            <p className="text-xs text-gray-600">Evento</p>
            <p className="font-semibold">{formatCurrency(incomeStats.byPaymentType.evento)}</p>
          </div>
        </div>
      </div>

      {/* Transacciones recientes */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">Transacciones Recientes</h3>
        {recentTransactions.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{transaction.plate} - {transaction.brand}</p>
                  <p className="text-xs text-gray-500">
                    {transaction.vehicleType.toUpperCase()} • {transaction.paymentType.replace('_', ' ')}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(transaction.date).toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-green-600">
                    {formatCurrency(transaction.amount)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.floor(transaction.duration / 60)}h {transaction.duration % 60}min
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6">
            No hay transacciones registradas aún.
          </div>
        )}
      </div>

      {/* Retiros recientes */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Retiros Recientes</h3>
        {recentWithdrawals.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentWithdrawals.map((w) => (
              <div key={w.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                <div>
                  <p className="text-sm font-medium">{w.note || 'Retiro de caja'}</p>
                  <p className="text-xs text-gray-400">
                    {new Date(w.date).toLocaleString('es-CO')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-red-600">- {formatCurrency(w.amount)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-6">No hay retiros registrados en este período.</div>
        )}
      </div>
    </div>
  );
};

function filterWithdrawalsByPeriod(list: CashWithdrawal[], periodo: string): CashWithdrawal[] {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  // Ajustar inicio de semana a lunes
  const dayOfWeek = (startOfDay.getDay() + 6) % 7; // 0=lunes, ... 6=domingo
  startOfWeek.setDate(startOfDay.getDate() - dayOfWeek);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  return list.filter((w) => {
    const d = new Date(w.date);
    switch (periodo) {
      case 'Día':
        return d >= startOfDay;
      case 'Semana':
        return d >= startOfWeek;
      case 'Mes':
        return d >= startOfMonth;
      case 'Año':
        return d >= startOfYear;
      default:
        return d >= startOfDay;
    }
  });
}

export default MovementHistory;