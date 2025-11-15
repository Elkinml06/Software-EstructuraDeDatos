// 🔹 Utilidades para cálculo de ingresos por períodos

export interface IncomeRecord {
  id: string;
  date: string; // ISO string
  plate: string;
  vehicleType: "carro" | "moto";
  brand: string;
  paymentType: "mensual" | "diario" | "por_tiempo" | "evento";
  amount: number;
  entryTime: string;
  exitTime: string;
  duration: number; // en minutos
}

export interface IncomeStats {
  total: number;
  count: number;
  byPaymentType: {
    mensual: number;
    diario: number;
    por_tiempo: number;
    evento: number;
  };
  byVehicleType: {
    carro: number;
    moto: number;
  };
}

// 🔹 Obtener registros de ingresos desde localStorage
export const getIncomeRecords = (): IncomeRecord[] => {
  try {
    const saved = localStorage.getItem("incomeRecords");
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error("Error loading income records:", error);
    return [];
  }
};

// 🔹 Calcular ingresos del día actual
export const getTodayIncome = (): IncomeStats => {
  const records = getIncomeRecords();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= today && recordDate < tomorrow;
  });

  return calculateStats(todayRecords);
};

// 🔹 Calcular ingresos de la semana actual
export const getWeekIncome = (): IncomeStats => {
  const records = getIncomeRecords();
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay()); // Domingo
  startOfWeek.setHours(0, 0, 0, 0);
  
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);

  const weekRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startOfWeek && recordDate < endOfWeek;
  });

  return calculateStats(weekRecords);
};

// 🔹 Calcular ingresos del mes actual
export const getMonthIncome = (): IncomeStats => {
  const records = getIncomeRecords();
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

  const monthRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startOfMonth && recordDate < endOfMonth;
  });

  return calculateStats(monthRecords);
};

// 🔹 Calcular ingresos del año actual
export const getYearIncome = (): IncomeStats => {
  const records = getIncomeRecords();
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear() + 1, 0, 1);

  const yearRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startOfYear && recordDate < endOfYear;
  });

  return calculateStats(yearRecords);
};

// 🔹 Función auxiliar para calcular estadísticas
const calculateStats = (records: IncomeRecord[]): IncomeStats => {
  const stats: IncomeStats = {
    total: 0,
    count: records.length,
    byPaymentType: {
      mensual: 0,
      diario: 0,
      por_tiempo: 0,
      evento: 0
    },
    byVehicleType: {
      carro: 0,
      moto: 0
    }
  };

  records.forEach(record => {
    stats.total += record.amount;
    stats.byPaymentType[record.paymentType] += record.amount;
    stats.byVehicleType[record.vehicleType] += record.amount;
  });

  return stats;
};

// 🔹 Obtener ingresos por rango de fechas personalizado
export const getIncomeByDateRange = (startDate: Date, endDate: Date): IncomeStats => {
  const records = getIncomeRecords();
  
  const rangeRecords = records.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate >= startDate && recordDate <= endDate;
  });

  return calculateStats(rangeRecords);
};

// 🔹 Formatear moneda colombiana
export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('es-CO')}`;
};