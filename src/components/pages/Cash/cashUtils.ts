// Utilidades para manejar la caja del día (Dinero en Caja)
import { getTodayIncome } from "./incomeUtils";

export interface CashStart {
  dateKey: string; // YYYY-MM-DD
  amount: number; // monto inicial en caja para el día
}

export interface CashWithdrawal {
  id: string;
  date: string; // ISO string
  dateKey: string; // YYYY-MM-DD
  amount: number;
  note?: string;
}

export const getDateKey = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const getCashStart = (): CashStart => {
  const saved = localStorage.getItem("cashStart");
  const todayKey = getDateKey();
  if (!saved) return { dateKey: todayKey, amount: 0 };
  try {
    const parsed = JSON.parse(saved) as CashStart;
    // Si es de otro día, resetear a 0 para hoy
    if (parsed.dateKey !== todayKey) {
      return { dateKey: todayKey, amount: 0 };
    }
    return parsed;
  } catch {
    return { dateKey: todayKey, amount: 0 };
  }
};

export const setCashStart = (amount: number): CashStart => {
  const start: CashStart = { dateKey: getDateKey(), amount };
  localStorage.setItem("cashStart", JSON.stringify(start));
  return start;
};

export const getWithdrawals = (): CashWithdrawal[] => {
  const saved = localStorage.getItem("cashWithdrawals");
  if (!saved) return [];
  try {
    return JSON.parse(saved) as CashWithdrawal[];
  } catch {
    return [];
  }
};

export const getWithdrawalsToday = (): CashWithdrawal[] => {
  const list = getWithdrawals();
  const todayKey = getDateKey();
  return list.filter((w) => w.dateKey === todayKey);
};

export const addWithdrawal = (amount: number, note?: string): CashWithdrawal => {
  const now = new Date();
  const item: CashWithdrawal = {
    id: `withdraw_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: now.toISOString(),
    dateKey: getDateKey(now),
    amount,
    note,
  };
  const list = getWithdrawals();
  const updated = [...list, item];
  localStorage.setItem("cashWithdrawals", JSON.stringify(updated));
  return item;
};

export const getWithdrawalsTotalToday = (): number => {
  return getWithdrawalsToday().reduce((sum, w) => sum + (w.amount || 0), 0);
};

export const computeCashOnHand = (): number => {
  const start = getCashStart();
  const todayIncome = getTodayIncome().total;
  const withdrawn = getWithdrawalsTotalToday();
  return start.amount + todayIncome - withdrawn;
};