import { FC, useState, useEffect, useCallback, useRef } from "react";

interface Vehicle {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthly: boolean;
  status: "dentro" | "fuera";
  entryTime: string | null;
  exitTime: string | null;
  price: number;
}

// Nueva interfaz para el registro de vehículos (solo datos básicos)
interface VehicleRegistry {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthlyExpiryDate?: string; // Fecha de vencimiento de mensualidad (ISO string)
}

// Nueva interfaz para vehículos activos (con datos de entrada)
interface ActiveVehicle {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  monthly: boolean;
  monthlyExpiryDate?: string; // Fecha de vencimiento de mensualidad
  entryTime: string;
  event?: boolean;
}

// 🔹 Nueva interfaz para registros de ingresos
interface IncomeRecord {
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

// 🔹 Nuevo registro para pagos diarios (persistente por día)
interface DailyPaymentRecord {
  plate: string;
  type: "carro" | "moto";
  brand: string;
  dateKey: string; // Formato YYYY-MM-DD en horario local
  createdAt: string; // ISO string
}

const VehicleForm: FC = () => {
  // 🔹 Estados para el nuevo sistema de localStorage - Inicializar con null para evitar sobrescribir localStorage
  const [vehicleRegistry, setVehicleRegistry] = useState<VehicleRegistry[]>([]);
  const [activeVehicles, setActiveVehicles] = useState<ActiveVehicle[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]); // Mantener para compatibilidad con vehicles.tsx
  const [incomeRecords, setIncomeRecords] = useState<IncomeRecord[]>([]); // 🔹 Nuevo estado para ingresos
  const [dailyPayments, setDailyPayments] = useState<DailyPaymentRecord[]>([]); // 🔹 Pagos diarios persistentes
  const [isDataLoaded, setIsDataLoaded] = useState(false); // Flag para controlar cuándo se han cargado los datos

  const [form, setForm] = useState({
    plate: "",
    type: "carro" as "carro" | "moto",
    brand: "",
    monthly: false,
    daily: false,
    event: false,
  });

  const [rates, setRates] = useState({
    moto: { min30: 1000, hour: 1300, monthly: 60000, daily: 15000, event: 3000 },
    car: {
      min15: 1600,
      min30: 2400,
      min45: 2800,
      hour: 3200,
      monthly: 100000,
      daily: 25000,
      event: 8000,
    },
  });

  // Nuevo estado para mostrar el precio calculado
  const [calculatedPrice, setCalculatedPrice] = useState<number>(0);
  const [eventActiveToday, setEventActiveToday] = useState(false);

  // Feedback no bloqueante, estilo platesList
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  // Ref de la entrada de placa para recuperar el foco tras alertas y reseteos
  const plateInputRef = useRef<HTMLInputElement>(null);
  const refocusPlateInput = () => {
    // Dar tiempo a alertas/impresiones para liberar el foco y luego recuperarlo
    const tryFocus = () => {
      try {
        window.focus();
      } catch (err) {
        void 0; // noop
      }
      // Asegurar ciclo blur->focus y posicionar el cursor al final
      try {
        plateInputRef.current?.blur();
      } catch (err) {
        void 0; // noop
      }
      plateInputRef.current?.focus();
      const len = plateInputRef.current?.value?.length ?? 0;
      try {
        plateInputRef.current?.setSelectionRange(len, len);
      } catch (err) {
        void 0; // noop
      }
    };

    // Primer intento rápido
    setTimeout(tryFocus, 150);
    // Segundo intento por si la UI aún está ocupada (alert/print)
    setTimeout(tryFocus, 350);
  };

  // Función para calcular el precio en tiempo real
  const calculateCurrentPrice = useCallback(() => {
    const plate = form.plate.toUpperCase();
    const activeVehicle = activeVehicles.find((v) => v.plate === plate);

    // Si el vehículo está dentro (para salida), calcular precio por tiempo usando el tipo del vehículo activo
    if (activeVehicle && !activeVehicle.monthly) {
      const now = new Date();
      const entryTime = new Date(activeVehicle.entryTime);
      const diffMs = now.getTime() - entryTime.getTime();
      const diffMinutes = diffMs / (1000 * 60);
      const diffMin = Math.ceil(diffMinutes);

      let costo = 0;

      if (activeVehicle.event) {
        const eventFee = activeVehicle.type === "moto" ? rates.moto.event : rates.car.event;
        if (diffMin <= 180) {
          costo = eventFee;
        } else {
          const extraMin = diffMin - 180;
          if (activeVehicle.type === "carro") {
            if (extraMin <= 15) costo = eventFee + rates.car.min15;
            else if (extraMin <= 30) costo = eventFee + rates.car.min30;
            else if (extraMin <= 45) costo = eventFee + rates.car.min45;
            else if (extraMin <= 60) costo = eventFee + rates.car.hour;
            else {
              const horasCompletas = Math.floor(extraMin / 60);
              const minutosRestantes = extraMin % 60;
              costo = eventFee + horasCompletas * rates.car.hour;
              if (minutosRestantes > 0 && minutosRestantes <= 15) costo += rates.car.min15;
              else if (minutosRestantes <= 30) costo += rates.car.min30;
              else if (minutosRestantes <= 45) costo += rates.car.min45;
              else costo += rates.car.hour;
            }
          } else {
            if (extraMin <= 30) costo = eventFee + rates.moto.min30;
            else if (extraMin <= 60) costo = eventFee + rates.moto.hour;
            else {
              const horasCompletas = Math.floor(extraMin / 60);
              const minutosRestantes = extraMin % 60;
              costo = eventFee + horasCompletas * rates.moto.hour;
              if (minutosRestantes > 0 && minutosRestantes <= 30) costo += rates.moto.min30;
              else if (minutosRestantes > 30) costo += rates.moto.hour;
            }
          }
        }
      } else {
        if (activeVehicle.type === "carro") {
          if (diffMin <= 15) costo = rates.car.min15;
          else if (diffMin <= 30) costo = rates.car.min30;
          else if (diffMin <= 45) costo = rates.car.min45;
          else if (diffMin <= 60) costo = rates.car.hour;
          else {
            const horasCompletas = Math.floor(diffMin / 60);
            const minutosRestantes = diffMin % 60;
            costo = horasCompletas * rates.car.hour;
            if (minutosRestantes > 0 && minutosRestantes <= 15)
              costo += rates.car.min15;
            else if (minutosRestantes <= 30) costo += rates.car.min30;
            else if (minutosRestantes <= 45) costo += rates.car.min45;
            else costo += rates.car.hour;
          }
        } else {
          if (diffMin <= 30) costo = rates.moto.min30;
          else if (diffMin <= 60) costo = rates.moto.hour;
          else {
            const horasCompletas = Math.floor(diffMin / 60);
            const minutosRestantes = diffMin % 60;
            costo = horasCompletas * rates.moto.hour;
            if (minutosRestantes > 0 && minutosRestantes <= 30)
              costo += rates.moto.min30;
            else if (minutosRestantes > 30) costo += rates.moto.hour;
          }
        }
      }

      return costo;
    }

    // Si es mensualidad, usar el tipo del formulario para nuevas entradas
    if (form.monthly) {
      return form.type === "moto" ? rates.moto.monthly : rates.car.monthly;
    }

    // Si es pago diario, usar el tipo del formulario para nuevas entradas
    if (form.daily) {
      return form.type === "moto" ? rates.moto.daily : rates.car.daily;
    }

    if (form.event && eventActiveToday) {
      return form.type === "moto" ? rates.moto.event : rates.car.event;
    }

    // Si es entrada nueva sin mensualidad ni diario, no mostrar precio
    return 0;
  }, [form.plate, form.type, form.monthly, form.daily, form.event, eventActiveToday, activeVehicles, rates]);

  // Actualizar precio calculado cuando cambien los datos relevantes
  useEffect(() => {
    const price = calculateCurrentPrice();
    setCalculatedPrice(price);
  }, [
    form.plate,
    form.type,
    form.monthly,
    form.daily,
    activeVehicles,
    rates,
    calculateCurrentPrice,
  ]);

  // 🔹 Cargar datos desde localStorage (solo una vez al montar el componente)
  useEffect(() => {
    const loadInitialData = () => {
      // Cargar registro de vehículos (historial completo)
      const savedRegistry = localStorage.getItem("vehicleRegistry");
      if (savedRegistry) {
        setVehicleRegistry(JSON.parse(savedRegistry));
      }

      // Cargar vehículos activos (actualmente dentro)
      const savedActive = localStorage.getItem("activeVehicles");
      if (savedActive) {
        setActiveVehicles(JSON.parse(savedActive));
      }

      // Mantener compatibilidad con vehicles.tsx
      const savedVehicles = localStorage.getItem("parkingVehicles");
      if (savedVehicles) setVehicles(JSON.parse(savedVehicles));

      // 🔹 Cargar registros de ingresos
      const savedIncomes = localStorage.getItem("incomeRecords");
      if (savedIncomes) {
        setIncomeRecords(JSON.parse(savedIncomes));
      }

      // 🔹 Cargar pagos diarios y limpiar los vencidos (solo mantener los de hoy)
      const savedDaily = localStorage.getItem("dailyPayments");
      if (savedDaily) {
        try {
          const parsed: DailyPaymentRecord[] = JSON.parse(savedDaily);
          const todayKey = getDateKey();
          const onlyToday = parsed.filter((p) => p.dateKey === todayKey);
          setDailyPayments(onlyToday);
        } catch (err) {
          // Si hay error en parseo, resetear para evitar corrupción
          setDailyPayments([]);
        }
      }

      // Leer tarifas desde la configuración
      const savedRates = localStorage.getItem("parkingRates");
      if (savedRates) {
        const parsed = JSON.parse(savedRates);
        setRates({
          moto: {
            min30: parsed.moto.min30,
            hour: parsed.moto.hour,
            monthly: parsed.moto.monthly,
            daily: parsed.moto.daily,
            event: parsed.moto.event ?? 3000,
          },
          car: {
            min15: parsed.car.min15,
            min30: parsed.car.min30,
            min45: parsed.car.min45,
            hour: parsed.car.hour,
            monthly: parsed.car.monthly,
            daily: parsed.car.daily,
            event: parsed.car.event ?? 8000,
          },
        });
      }

      const evKey = localStorage.getItem("eventActiveDateKey");
      setEventActiveToday(evKey === getDateKey());

      // Marcar que los datos se han cargado
      setIsDataLoaded(true);
    };

    // Cargar datos solo una vez al inicio
    loadInitialData();

    // 🔹 Escuchar eventos de storage para sincronización entre pestañas/ventanas
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "vehicleRegistry" && e.newValue) {
        setVehicleRegistry(JSON.parse(e.newValue));
      } else if (e.key === "activeVehicles" && e.newValue) {
        setActiveVehicles(JSON.parse(e.newValue));
      } else if (e.key === "parkingVehicles" && e.newValue) {
        setVehicles(JSON.parse(e.newValue));
      } else if (e.key === "incomeRecords" && e.newValue) {
        setIncomeRecords(JSON.parse(e.newValue));
      } else if (e.key === "dailyPayments" && e.newValue) {
        try {
          const parsed: DailyPaymentRecord[] = JSON.parse(e.newValue);
          const todayKey = getDateKey();
          const onlyToday = parsed.filter((p) => p.dateKey === todayKey);
          setDailyPayments(onlyToday);
        } catch (err) {
          setDailyPayments([]);
        }
      } else if (e.key === "parkingRates" && e.newValue) {
        const parsed = JSON.parse(e.newValue);
        setRates((prev) => ({
          moto: {
            min30: parsed.moto.min30,
            hour: parsed.moto.hour,
            monthly: parsed.moto.monthly,
            daily: parsed.moto.daily,
            event: parsed.moto.event ?? prev.moto.event,
          },
          car: {
            min15: parsed.car.min15,
            min30: parsed.car.min30,
            min45: parsed.car.min45,
            hour: parsed.car.hour,
            monthly: parsed.car.monthly,
            daily: parsed.car.daily,
            event: parsed.car.event ?? prev.car.event,
          },
        }));
      } else if (e.key === "eventActiveDateKey") {
        setEventActiveToday((e.newValue ?? "") === getDateKey());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Refrescar tarifas al recuperar foco de la ventana (por si se editaron en Configuración)
  useEffect(() => {
    const onFocus = () => {
      const savedRates = localStorage.getItem("parkingRates");
      if (savedRates) {
        const parsed = JSON.parse(savedRates);
        setRates((prev) => ({
          moto: {
            min30: parsed.moto.min30,
            hour: parsed.moto.hour,
            monthly: parsed.moto.monthly,
            daily: parsed.moto.daily,
            event: parsed.moto.event ?? prev.moto.event,
          },
          car: {
            min15: parsed.car.min15,
            min30: parsed.car.min30,
            min45: parsed.car.min45,
            hour: parsed.car.hour,
            monthly: parsed.car.monthly,
            daily: parsed.car.daily,
            event: parsed.car.event ?? prev.car.event,
          },
        }));
      }
    };
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // 🔹 Helper para guardar en localStorage sólo si cambia
  const saveIfChanged = (key: string, value: unknown) => {
    const currentData = JSON.stringify(value);
    const savedData = localStorage.getItem(key);
    if (currentData !== savedData) {
      localStorage.setItem(key, currentData);
    }
  };

  // 🔹 Helper: clave de fecha local YYYY-MM-DD
  const getDateKey = (date: Date = new Date()) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 🔹 Helper: verificar si un vehículo tiene pago diario vigente hoy
  const hasDailyPaymentToday = (plate: string) => {
    const upper = plate.toUpperCase();
    const todayKey = getDateKey();
    return dailyPayments.some(
      (p) => p.plate === upper && p.dateKey === todayKey
    );
  };

  // 🔹 Guardar datos en localStorage al cambiar (consolidado)
  useEffect(() => {
    if (!isDataLoaded) return;
    saveIfChanged("vehicleRegistry", vehicleRegistry);
    saveIfChanged("activeVehicles", activeVehicles);
    // Mantener compatibilidad con vehicles.tsx
    saveIfChanged("parkingVehicles", vehicles);
    // Guardar registros de ingresos
    saveIfChanged("incomeRecords", incomeRecords);
    // Guardar pagos diarios
    saveIfChanged("dailyPayments", dailyPayments);
  }, [vehicleRegistry, activeVehicles, vehicles, incomeRecords, dailyPayments, isDataLoaded]);

  // 🔹 Buscar placa existente con nueva lógica mejorada
  const handlePlateChange = (plate: string) => {
    const upper = plate.toUpperCase();

    // Si la placa está vacía, resetear formulario
    if (!upper.trim()) {
      setForm({
        plate: "",
        type: "carro",
        brand: "",
        monthly: false,
        daily: false,
        event: false,
      });
      refocusPlateInput();
      return;
    }

    // 🔹 Placa especial: 0101 -> Reimprimir la última factura
    if (upper === "0101") {
      if (!incomeRecords || incomeRecords.length === 0) {
        showFeedback('info', 'No hay factura previa para reimprimir');
        refocusPlateInput();
        return;
      }

      // Tomar el último registro por fecha
      const last = incomeRecords.reduce((prev, curr) =>
        new Date(curr.date) > new Date(prev.date) ? curr : prev
      , incomeRecords[0]);

      const isExit = last.paymentType === 'por_tiempo' && !!last.exitTime;
      const paymentLabel = last.paymentType === 'diario'
        ? 'Pago diario'
        : last.paymentType === 'mensual'
          ? 'Mensualidad'
          : undefined;

      const lastVehicle: Vehicle = {
        plate: last.plate,
        type: last.vehicleType,
        brand: last.brand,
        monthly: last.paymentType === 'mensual',
        status: 'fuera',
        entryTime: last.entryTime,
        exitTime: last.exitTime,
        price: last.amount,
      };

      showFeedback('success', 'Imprimiendo última factura');
      printReceipt(lastVehicle, isExit, paymentLabel);

      // Limpiar el formulario y recuperar foco
      setForm({
        plate: "",
        type: "carro",
        brand: "",
        monthly: false,
        daily: false,
        event: false,
      });
      refocusPlateInput();
      return;
    }

    // Búsqueda de placa en registros y vehículos activos

    // 🔹 SIEMPRE buscar primero en el registro actualizado para obtener los datos más recientes
    const registeredVehicle = vehicleRegistry.find((v) => v.plate === upper);

    // 1. Verificar si el vehículo está actualmente dentro (para salida)
    const activeVehicle = activeVehicles.find((v) => v.plate === upper);

    if (activeVehicle) {
      // 🔹 Si tiene pago diario vigente, mostrar estado en la UI sin limpiar la placa
      if (hasDailyPaymentToday(upper)) {
        // Mantener datos visibles para que el usuario pueda cambiar de placa
        const currentData = registeredVehicle || activeVehicle;
        setForm({
          plate: currentData.plate,
          type: currentData.type,
          brand: currentData.brand,
          monthly: activeVehicle.monthly,
          daily: false,
          event: false,
        });
        return;
      }
      // 🔹 USAR DATOS ACTUALIZADOS del registro si existen, sino usar los del vehículo activo
      const currentData = registeredVehicle || activeVehicle;

      // Si está activo, autocompletar todos los datos para salida con información actualizada
      const finalFormData = {
        plate: currentData.plate,
        type: currentData.type,
        brand: currentData.brand,
        monthly: activeVehicle.monthly, // Mantener el estado de mensualidad del vehículo activo
        daily: false,
        event: false,
      };

      setForm(finalFormData);
      return;
    }

    // 2. Si no está activo, buscar en el registro histórico (para re-entrada)
    if (registeredVehicle) {
      // 🔹 Pago diario vigente: no limpiar, solo mostrar estado en UI
      if (hasDailyPaymentToday(upper)) {
      const reEntryFormData = {
        plate: upper,
        type: registeredVehicle.type,
        brand: registeredVehicle.brand,
        monthly: false,
        daily: false,
        event: false,
      };
        setForm(reEntryFormData);
        // Continuar para que la UI muestre el mensaje de bloqueo y estilos
      }
      // Verificar si tiene mensualidad vigente
      const hasValidMonthly =
        registeredVehicle.monthlyExpiryDate &&
        new Date(registeredVehicle.monthlyExpiryDate) > new Date();

      // 🚫 BLOQUEAR ACCESO SI TIENE MENSUALIDAD VIGENTE (sin limpiar la placa)
      if (hasValidMonthly) {
        const expiryDate = new Date(registeredVehicle.monthlyExpiryDate!);
        showFeedback(
          'error',
          `🚫 ACCESO BLOQUEADO: mensualidad vigente hasta el ${expiryDate.toLocaleDateString("es-CO")}.`
        );

        // Mantener la placa escrita para permitir cambiarla manualmente
        setForm({
          plate: upper,
          type: registeredVehicle.type,
          brand: registeredVehicle.brand,
          monthly: false,
          daily: false,
          event: false,
        });
        // Recuperar foco tras el feedback
        refocusPlateInput();
        return;
      }

      // ✅ AUTOCOMPLETAR DATOS PARA RE-ENTRADA
      const reEntryFormData = {
        plate: upper,
        type: registeredVehicle.type,
        brand: registeredVehicle.brand,
        monthly: false, // No marcar mensualidad para re-entrada normal
        daily: false,
        event: false,
      };

      setForm(reEntryFormData);

      // Mostrar información de mensualidad si existe pero está vencida
      if (registeredVehicle.monthlyExpiryDate) {
        const expiryDate = new Date(registeredVehicle.monthlyExpiryDate);
        const isExpired = expiryDate <= new Date();

        if (isExpired) {
          showFeedback(
            'info',
            `⚠️ Mensualidad vencida el ${expiryDate.toLocaleDateString("es-CO")}. Puede proceder con el registro.`
          );
        }
      }
    } else {
      // 3. Si no existe en ningún lado, preparar campos para nueva entrada
      // 🔹 Si la placa tiene pago diario vigente se mostrará restricción sin limpiar
      if (hasDailyPaymentToday(upper)) {
        setForm({
          plate: upper,
          type: "carro",
          brand: "",
          monthly: false,
          daily: false,
          event: false,
        });
        // No retornar; permitir que el usuario cambie la placa si desea
      }
      const newVehicleFormData = {
        plate: upper,
        type: "carro" as "carro" | "moto",
        brand: "",
        monthly: false,
        daily: false,
        event: false,
      };

      setForm(newVehicleFormData);
    }
  };

  // 🧾 Imprimir directo (sin modal ni PDF)
  const printReceipt = (
    vehicle: Vehicle,
    isExit: boolean,
    paymentLabel?: string
  ) => {
    const fecha = new Date().toLocaleString();

    const content = `
      <html>
        <body style="font-family: monospace; font-size: 12px; padding: 10px; width: 58mm;">
          <div style="text-align:center;">
            <h3>🅿️ 256 PARKING</h3>
            <p>${fecha}</p>
            <hr/>
          </div>

          <p><strong>Placa:</strong> ${vehicle.plate}</p>
          <p><strong>Tipo:</strong> ${vehicle.type}</p>
          <p><strong>Marca:</strong> ${vehicle.brand}</p>
          ${
            isExit
              ? `
              <p><strong>Entrada:</strong> ${new Date(
                vehicle.entryTime!
              ).toLocaleString()}</p>
              <p><strong>Salida:</strong> ${new Date(
                vehicle.exitTime!
              ).toLocaleString()}</p>
              <p><strong>Total:</strong> $${vehicle.price.toLocaleString()}</p>
            `
              : `
              <p><strong>Entrada:</strong> ${new Date(
                vehicle.entryTime!
              ).toLocaleString()}</p>
              ${paymentLabel ? `<p><strong>Pago:</strong> ${paymentLabel}</p>` : ``}
              ${
                vehicle.price && vehicle.price > 0
                  ? `<p><strong>Total:</strong> $${vehicle.price.toLocaleString()}</p>`
                  : ``
              }
              <p>⚠️ Guarde este comprobante</p>
            `
          }

          <hr/>
          <div style="text-align:center;">
            <p>¡Gracias por preferirnos!</p>
            <p>🌐 256 PARKING</p>
          </div>
        </body>
      </html>
    `;

    // Imprimir vía Electron de forma silenciosa si está disponible
    if (window.ipcRenderer) {
      window.ipcRenderer
        .invoke("print-receipt", content)
        .finally(() => {
          refocusPlateInput();
        });
      return;
    }

    // Fallback a impresión del navegador si no hay contexto Electron
    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(content);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      setTimeout(() => {
        try { printWindow.close(); } catch { void 0; }
        refocusPlateInput();
      }, 500);
    }
  };

  // 🔹 Función para crear registro de ingreso
  const createIncomeRecord = (
    vehicle: ActiveVehicle,
    exitTime: Date,
    amount: number,
    duration: number
  ) => {
    const newIncomeRecord: IncomeRecord = {
      id: `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: exitTime.toISOString(),
      plate: vehicle.plate,
      vehicleType: vehicle.type,
      brand: vehicle.brand,
      paymentType: vehicle.monthly ? "mensual" : (vehicle.event ? "evento" : "por_tiempo"),
      amount: amount,
      entryTime: vehicle.entryTime,
      exitTime: exitTime.toISOString(),
      duration: duration,
    };

    setIncomeRecords((prev) => [...prev, newIncomeRecord]);
    return newIncomeRecord;
  };

  // 🔹 Registro de ingreso por pago diario (sin entrada/salida)
  const createDailyIncomeRecord = (
    plate: string,
    type: "carro" | "moto",
    brand: string,
    amount: number
  ) => {
    const now = new Date();
    const newIncomeRecord: IncomeRecord = {
      id: `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: now.toISOString(),
      plate,
      vehicleType: type,
      brand,
      paymentType: "diario",
      amount,
      entryTime: now.toISOString(),
      exitTime: now.toISOString(),
      duration: 0,
    };
    setIncomeRecords((prev) => [...prev, newIncomeRecord]);
    return newIncomeRecord;
  };

  // 🔹 Registro de ingreso por pago mensual (sin entrada/salida)
  const createMonthlyIncomeRecord = (
    plate: string,
    type: "carro" | "moto",
    brand: string,
    amount: number
  ) => {
    const now = new Date();
    const newIncomeRecord: IncomeRecord = {
      id: `income_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: now.toISOString(),
      plate,
      vehicleType: type,
      brand,
      paymentType: "mensual",
      amount,
      entryTime: now.toISOString(),
      exitTime: now.toISOString(),
      duration: 0,
    };
    setIncomeRecords((prev) => [...prev, newIncomeRecord]);
    return newIncomeRecord;
  };

  // 🔹 Registrar entrada o salida con nueva lógica
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const plate = form.plate.toUpperCase();

    // 🚫 VALIDACIÓN ADICIONAL: Verificar mensualidad vigente antes de cualquier registro
    const registeredVehicle = vehicleRegistry.find((v) => v.plate === plate);
    if (registeredVehicle?.monthlyExpiryDate) {
      const hasValidMonthly =
        new Date(registeredVehicle.monthlyExpiryDate) > new Date();
      if (hasValidMonthly) {
        const expiryDate = new Date(registeredVehicle.monthlyExpiryDate);
        showFeedback(
          'error',
          `🚫 REGISTRO BLOQUEADO: mensualidad vigente hasta el ${expiryDate.toLocaleDateString("es-CO")}.`
        );
        refocusPlateInput();
        return; // Bloquear completamente el registro
      }
    }

    // 🚫 VALIDACIÓN: Bloquear completamente si tiene pago diario vigente para hoy
    if (hasDailyPaymentToday(plate)) {
      showFeedback(
        'error',
        `🚫 REGISTRO BLOQUEADO: pago diario vigente para hoy (${new Date().toLocaleDateString("es-CO")}).`
      );
      refocusPlateInput();
      return;
    }

    // Verificar si el vehículo está actualmente dentro
    const activeVehicle = activeVehicles.find((v) => v.plate === plate);

    // --- Registrar salida ---
    if (activeVehicle) {
      // 🔹 Confirmación mejorada para salida
      const entryTime = new Date(activeVehicle.entryTime);
      const exitTime = new Date();
      const diffMs = exitTime.getTime() - entryTime.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      // Calcular precio preliminar para mostrar en confirmación
      let preliminaryPrice = 0;
      if (activeVehicle.monthly) {
        preliminaryPrice =
          activeVehicle.type === "moto"
            ? rates.moto.monthly
            : rates.car.monthly;
      } else if (activeVehicle.event) {
        const diffMin = Math.ceil(diffMinutes);
        const eventFee = activeVehicle.type === "moto" ? rates.moto.event : rates.car.event;
        if (diffMin <= 180) {
          preliminaryPrice = eventFee;
        } else {
          const extraMin = diffMin - 180;
          if (activeVehicle.type === "carro") {
            if (extraMin <= 15) preliminaryPrice = eventFee + rates.car.min15;
            else if (extraMin <= 30) preliminaryPrice = eventFee + rates.car.min30;
            else if (extraMin <= 45) preliminaryPrice = eventFee + rates.car.min45;
            else if (extraMin <= 60) preliminaryPrice = eventFee + rates.car.hour;
            else {
              const horasCompletas = Math.floor(extraMin / 60);
              const minutosRestantes = extraMin % 60;
              preliminaryPrice = eventFee + horasCompletas * rates.car.hour;
              if (minutosRestantes > 0 && minutosRestantes <= 15) preliminaryPrice += rates.car.min15;
              else if (minutosRestantes <= 30) preliminaryPrice += rates.car.min30;
              else if (minutosRestantes <= 45) preliminaryPrice += rates.car.min45;
              else preliminaryPrice += rates.car.hour;
            }
          } else {
            if (extraMin <= 30) preliminaryPrice = eventFee + rates.moto.min30;
            else if (extraMin <= 60) preliminaryPrice = eventFee + rates.moto.hour;
            else {
              const horasCompletas = Math.floor(extraMin / 60);
              const minutosRestantes = extraMin % 60;
              preliminaryPrice = eventFee + horasCompletas * rates.moto.hour;
              if (minutosRestantes > 0 && minutosRestantes <= 30) preliminaryPrice += rates.moto.min30;
              else if (minutosRestantes > 30) preliminaryPrice += rates.moto.hour;
            }
          }
        }
      } else {
        const diffMin = Math.ceil(diffMinutes);
        if (activeVehicle.type === "carro") {
          if (diffMin <= 15) preliminaryPrice = rates.car.min15;
          else if (diffMin <= 30) preliminaryPrice = rates.car.min30;
          else if (diffMin <= 45) preliminaryPrice = rates.car.min45;
          else if (diffMin <= 60) preliminaryPrice = rates.car.hour;
          else {
            const horasCompletas = Math.floor(diffMin / 60);
            const minutosRestantes = diffMin % 60;
            preliminaryPrice = horasCompletas * rates.car.hour;
            if (minutosRestantes > 0 && minutosRestantes <= 15)
              preliminaryPrice += rates.car.min15;
            else if (minutosRestantes <= 30)
              preliminaryPrice += rates.car.min30;
            else if (minutosRestantes <= 45)
              preliminaryPrice += rates.car.min45;
            else preliminaryPrice += rates.car.hour;
          }
        } else {
          if (diffMin <= 30) preliminaryPrice = rates.moto.min30;
          else if (diffMin <= 60) preliminaryPrice = rates.moto.hour;
          else {
            const horasCompletas = Math.floor(diffMin / 60);
            const minutosRestantes = diffMin % 60;
            preliminaryPrice = horasCompletas * rates.moto.hour;
            if (minutosRestantes > 0 && minutosRestantes <= 30)
              preliminaryPrice += rates.moto.min30;
            else if (minutosRestantes > 30) preliminaryPrice += rates.moto.hour;
          }
        }
      }

      // Mostrar confirmación con detalles
      const timeSpent = Math.ceil(diffMinutes);
      const hours = Math.floor(timeSpent / 60);
      const minutes = timeSpent % 60;
      const timeDisplay =
        hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;

      const confirmMessage =
        `🚗 CONFIRMAR SALIDA\n\n` +
        `Placa: ${activeVehicle.plate}\n` +
        `Marca: ${activeVehicle.brand}\n` +
        `Tipo: ${activeVehicle.type.toUpperCase()}\n` +
        `Entrada: ${entryTime.toLocaleString("es-CO")}\n` +
        `Tiempo: ${timeDisplay}\n` +
        `${
          activeVehicle.monthly ? "Tipo: MENSUALIDAD" : activeVehicle.event ? "Tipo: Evento" : "Tipo: Por tiempo"
        }\n` +
        `Total a pagar: $${preliminaryPrice.toLocaleString("es-CO")}\n\n` +
        `¿Confirmar salida y generar recibo?`;

      if (!confirm(confirmMessage)) {
        return; // Usuario canceló
      }

      const exitTime2 = new Date();

      let total = 0;

      if (activeVehicle.monthly) {
        // Si es mensualidad, usar tarifa mensual
        total =
          activeVehicle.type === "moto"
            ? rates.moto.monthly
            : rates.car.monthly;
      } else if (activeVehicle.event) {
        const diffMin = Math.ceil(diffMinutes);
        const eventFee = activeVehicle.type === "moto" ? rates.moto.event : rates.car.event;
        if (diffMin <= 180) {
          total = eventFee;
        } else {
          const extraMin = diffMin - 180;
          let extra = 0;
          if (activeVehicle.type === "carro") {
            if (extraMin <= 15) extra = rates.car.min15;
            else if (extraMin <= 30) extra = rates.car.min30;
            else if (extraMin <= 45) extra = rates.car.min45;
            else if (extraMin <= 60) extra = rates.car.hour;
            else {
              const horasCompletas = Math.floor(extraMin / 60);
              const minutosRestantes = extraMin % 60;
              extra = horasCompletas * rates.car.hour;
              if (minutosRestantes > 0 && minutosRestantes <= 15) extra += rates.car.min15;
              else if (minutosRestantes <= 30) extra += rates.car.min30;
              else if (minutosRestantes <= 45) extra += rates.car.min45;
              else extra += rates.car.hour;
            }
          } else {
            if (extraMin <= 30) extra = rates.moto.min30;
            else if (extraMin <= 60) extra = rates.moto.hour;
            else {
              const horasCompletas = Math.floor(extraMin / 60);
              const minutosRestantes = extraMin % 60;
              extra = horasCompletas * rates.moto.hour;
              if (minutosRestantes > 0 && minutosRestantes <= 30) extra += rates.moto.min30;
              else if (minutosRestantes > 30) extra += rates.moto.hour;
            }
          }
          total = eventFee + extra;
        }
      } else {
        // Calcular según tiempo transcurrido usando la nueva estructura de precios
        const diffMin = Math.ceil(diffMinutes);
        let costo = 0;

        if (activeVehicle.type === "carro") {
          // Tarifas para carros
          if (diffMin <= 15) costo = rates.car.min15;
          else if (diffMin <= 30) costo = rates.car.min30;
          else if (diffMin <= 45) costo = rates.car.min45;
          else if (diffMin <= 60) costo = rates.car.hour;
          else {
            // Cada hora adicional
            const horasCompletas = Math.floor(diffMin / 60);
            const minutosRestantes = diffMin % 60;
            costo = horasCompletas * rates.car.hour;

            if (minutosRestantes > 0 && minutosRestantes <= 15)
              costo += rates.car.min15;
            else if (minutosRestantes <= 30) costo += rates.car.min30;
            else if (minutosRestantes <= 45) costo += rates.car.min45;
            else costo += rates.car.hour;
          }
        } else {
          // Tarifas para motos
          if (diffMin <= 30) costo = rates.moto.min30;
          else if (diffMin <= 60) costo = rates.moto.hour;
          else {
            const horasCompletas = Math.floor(diffMin / 60);
            const minutosRestantes = diffMin % 60;
            costo = horasCompletas * rates.moto.hour;
            if (minutosRestantes > 0 && minutosRestantes <= 30)
              costo += rates.moto.min30;
            else if (minutosRestantes > 30) costo += rates.moto.hour;
          }
        }

        total = costo;
      }

      // Remover de vehículos activos
      const updatedActiveVehicles = activeVehicles.filter(
        (v) => v.plate !== plate
      );
      setActiveVehicles(updatedActiveVehicles);

      // Crear registro de salida para el historial completo (vehicles.tsx)
      const exitVehicle: Vehicle = {
        plate: activeVehicle.plate,
        type: activeVehicle.type,
        brand: activeVehicle.brand,
        monthly: activeVehicle.monthly,
        status: "fuera",
        entryTime: activeVehicle.entryTime,
        exitTime: exitTime2.toISOString(),
        price: total,
      };

      // Actualizar historial completo
      const updatedVehicles: Vehicle[] = vehicles.map((v) =>
        v.plate === plate && v.status === "dentro"
          ? {
              ...v,
              status: "fuera",
              exitTime: exitTime.toISOString(),
              price: total,
            }
          : v
      );
      setVehicles(updatedVehicles);

      // 🔹 Registrar ingreso automáticamente
      const durationMinutes = Math.ceil(diffMinutes);
      createIncomeRecord(activeVehicle, exitTime2, total, durationMinutes);

      // Imprimir factura de salida
      printReceipt(exitVehicle, true);

      // Reiniciar formulario
      setForm({
        plate: "",
        type: "carro",
        brand: "",
        monthly: false,
        daily: false,
        event: false,
      });
      refocusPlateInput();
      return;
    }

    // --- Registrar entrada ---
    // Calcular fecha de vencimiento de mensualidad si aplica
    let monthlyExpiryDate: string | undefined;
    if (form.monthly) {
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 1); // Agregar 1 mes
      monthlyExpiryDate = expiryDate.toISOString();
    }

    // 🔹 Si es pago diario: registrar pago y bloquear por el día (no crear entrada)
    if (form.daily) {
      // 1) Actualizar/crear registro histórico de vehículo (tipo/marca)
      const existsInRegistry = vehicleRegistry.find((v) => v.plate === plate);
      if (!existsInRegistry) {
        const newRegistryEntry: VehicleRegistry = {
          plate,
          type: form.type,
          brand: form.brand,
        };
        setVehicleRegistry([...vehicleRegistry, newRegistryEntry]);
      } else {
        const updatedRegistry = vehicleRegistry.map((v) =>
          v.plate === plate ? { ...v, type: form.type, brand: form.brand } : v
        );
        setVehicleRegistry(updatedRegistry);
      }

      // 2) Crear registro de pago diario persistente
      const todayKey = getDateKey();
      const newDailyPayment: DailyPaymentRecord = {
        plate,
        type: form.type,
        brand: form.brand,
        dateKey: todayKey,
        createdAt: new Date().toISOString(),
      };
      // Evitar duplicados por placa para hoy
      const filtered = dailyPayments.filter(
        (p) => !(p.plate === plate && p.dateKey === todayKey)
      );
      setDailyPayments([...filtered, newDailyPayment]);

      // 3) Crear ingreso de tipo diario
      const amount = form.type === "moto" ? rates.moto.daily : rates.car.daily;
      createDailyIncomeRecord(plate, form.type, form.brand, amount);

      // 4) Confirmar registro exitoso (primero)
      showFeedback('success', 'Vehículo registrado correctamente ✅');

      // 5) Imprimir comprobante de pago diario (después del alert, igual que mensualidad)
      const nowIso = new Date().toISOString();
      const tempVehicleForPrint: Vehicle = {
        plate,
        type: form.type,
        brand: form.brand,
        monthly: false,
        status: "dentro",
        entryTime: nowIso,
        exitTime: null,
        price: amount,
      };
      printReceipt(tempVehicleForPrint, false, "Pago diario");

      // Reiniciar formulario sin crear vehículo activo
      setForm({ plate: "", type: "carro", brand: "", monthly: false, daily: false, event: false });
      setForm((prev) => ({ ...prev, event: false }));
      refocusPlateInput();
      return;
    }

    // 🔹 Si es pago mensual: registrar pago y bloquear por el período (no crear entrada)
    if (form.monthly) {
      // 1) Actualizar/crear registro histórico de vehículo (tipo/marca) y mensualidad
      const existsInRegistry = vehicleRegistry.find((v) => v.plate === plate);
      if (!existsInRegistry) {
        const newRegistryEntry: VehicleRegistry = {
          plate,
          type: form.type,
          brand: form.brand,
          monthlyExpiryDate,
        };
        setVehicleRegistry([...vehicleRegistry, newRegistryEntry]);
      } else {
        const updatedRegistry = vehicleRegistry.map((v) =>
          v.plate === plate
            ? { ...v, type: form.type, brand: form.brand, monthlyExpiryDate }
            : v
        );
        setVehicleRegistry(updatedRegistry);
      }

      // 2) Crear ingreso de tipo mensual
      const amount = form.type === "moto" ? rates.moto.monthly : rates.car.monthly;
      createMonthlyIncomeRecord(plate, form.type, form.brand, amount);

      // 3) Confirmar registro exitoso
      showFeedback('success', 'Vehículo registrado correctamente ✅');

      // 4) Imprimir comprobante de pago mensual
      const nowIso = new Date().toISOString();
      const tempVehicleForPrint: Vehicle = {
        plate,
        type: form.type,
        brand: form.brand,
        monthly: true,
        status: "dentro",
        entryTime: nowIso,
        exitTime: null,
        price: amount,
      };
      printReceipt(tempVehicleForPrint, false, "Pago mensual");

      // Reiniciar formulario sin crear vehículo activo
      setForm({ plate: "", type: "carro", brand: "", monthly: false, daily: false, event: false });
      refocusPlateInput();
      return;
    }

    // 1. Agregar al registro histórico si no existe, o actualizar información
    const existsInRegistry = vehicleRegistry.find((v) => v.plate === plate);
    if (!existsInRegistry) {
      // Vehículo completamente nuevo
      const newRegistryEntry: VehicleRegistry = {
        plate,
        type: form.type,
        brand: form.brand,
        monthlyExpiryDate,
      };
      setVehicleRegistry([...vehicleRegistry, newRegistryEntry]);
    } else {
      // Vehículo ya existe: actualizar información (tipo, marca) y mensualidad si aplica
      const updatedRegistry = vehicleRegistry.map((v) =>
        v.plate === plate
          ? {
              ...v,
              type: form.type, // ✅ Actualizar tipo
              brand: form.brand, // ✅ Actualizar marca
              monthlyExpiryDate: form.monthly
                ? monthlyExpiryDate
                : v.monthlyExpiryDate, // Solo actualizar mensualidad si se está pagando
            }
          : v
      );
      setVehicleRegistry(updatedRegistry);
    }

    // 2. Agregar a vehículos activos
    const newActiveVehicle: ActiveVehicle = {
      plate,
      type: form.type,
      brand: form.brand,
      monthly: form.monthly,
      monthlyExpiryDate,
      event: form.event && eventActiveToday,
      entryTime: new Date().toISOString(),
    };
    setActiveVehicles([...activeVehicles, newActiveVehicle]);

    // 3. Mantener compatibilidad con vehicles.tsx
    const newVehicle: Vehicle = {
      plate,
      type: form.type,
      brand: form.brand,
      monthly: form.monthly,
      status: "dentro",
      entryTime: new Date().toISOString(),
      exitTime: null,
      price: 0,
    };
    setVehicles([...vehicles, newVehicle]);

    showFeedback('success', 'Vehículo registrado correctamente ✅');

    // Imprimir comprobante de entrada
    printReceipt(newVehicle, false, form.monthly ? "Pago mensual" : undefined);

    // Reiniciar formulario
    setForm({
      plate: "",
      type: "carro",
      brand: "",
      monthly: false,
      daily: false,
      event: false,
    });
    // Recuperar el foco para permitir seguir escribiendo inmediatamente
    refocusPlateInput();
  };

  // Variables para la UI con nueva lógica
  const vehicleInside = activeVehicles.find((v) => v.plate === form.plate);
  const vehicleInRegistry = vehicleRegistry.find((v) => v.plate === form.plate);

  // Verificar si tiene mensualidad vigente (para bloquear completamente)
  const hasValidMonthly =
    vehicleInRegistry?.monthlyExpiryDate &&
    new Date(vehicleInRegistry.monthlyExpiryDate) > new Date();

  // Verificar si tiene pago diario vigente (para bloquear completamente)
  const hasValidDaily = form.plate ? hasDailyPaymentToday(form.plate) : false;

  // Solo deshabilitar campos si el vehículo existe en el registro Y no está actualmente dentro
  const shouldDisableFields = Boolean(
    (vehicleInRegistry && !vehicleInside) || hasValidMonthly || hasValidDaily
  );

  // 🔹 Handlers comunes para evitar repetición en onFocus/onBlur
  const handleFocus = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLButtonElement
    >
  ) => {
    // Mantener el color azul en botones; aplicar negro solo a inputs/selects
    const tag = e.currentTarget.tagName;
    if (tag !== "BUTTON") {
      e.currentTarget.style.color = "var(--color-black)";
    } else {
      e.currentTarget.style.color = "var(--color-blue)";
    }
  };

  const handleBlur = (
    e: React.FocusEvent<
      HTMLInputElement | HTMLSelectElement | HTMLButtonElement
    >
  ) => {
    e.currentTarget.style.borderWidth = "1px";
  };

  return (
    <main
      className=" flex items-center justify-center p-6 mt-5"
      style={{ backgroundColor: "var(--color-white)" }}
    >
      <div
        className="shadow-md rounded-2xl w-full max-w-md p-8 border"
        style={{
          backgroundColor: "var(--color-white)",
          borderColor: "var(--color-gray-light)",
        }}
      >
        <h1
          className="text-2xl font-bold mb-6 text-center"
          style={{ color: "var(--color-blue)" }}
        >
          Registro de Vehículo
        </h1>

        {feedback && (
          <div
            className={`mb-4 p-3 rounded-md text-sm ${
              feedback.type === 'success'
                ? 'bg-green-100 text-green-800'
                : feedback.type === 'error'
                ? 'bg-red-100 text-red-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {feedback.message}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Placa */}
          <div>
            <label
              className="block text-sm font-medium mb-1"
              style={{ color: "var(--color-text-dark)" }}
            >
              Nº Placa
            </label>
            <div className="relative">
              <input
                type="text"
                value={form.plate}
                onChange={(e) => handlePlateChange(e.target.value)}
                placeholder="Ej: ABC123"
                className="w-full border rounded-md px-3 py-2 uppercase focus:outline-none transition-all duration-200"
                ref={plateInputRef}
                style={{
                  color: "var(--color-black)",
                  backgroundColor: vehicleInside
                    ? "rgba(58, 134, 255, 0.1)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "rgba(58, 134, 255, 0.1)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-gray-light)"
                    : "var(--color-white)",
                  borderColor: vehicleInside
                    ? "var(--color-blue)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "var(--color-blue)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-gray-dark)"
                    : "var(--color-gray-dark)",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
              />
              {form.plate && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 transition-all duration-200">
                  {vehicleInside ? (
                    <span
                      className="inline-block w-2 h-2 rounded-full transition-all duration-200"
                      style={{ backgroundColor: "var(--color-blue)" }}
                    />
                  ) : vehicleInRegistry && !hasValidMonthly && !hasValidDaily ? (
                    <span
                      className="inline-block w-2 h-2 rounded-full transition-all duration-200"
                      style={{ backgroundColor: "var(--color-blue)" }}
                    />
                  ) : hasValidMonthly || hasValidDaily ? (
                    <span
                      className="inline-block w-2 h-2 rounded-full border transition-all duration-200"
                      style={{
                        backgroundColor: "var(--color-gray-light)",
                        borderColor: "var(--color-gray-dark)",
                      }}
                    />
                  ) : (
                    <span
                      className="inline-block w-2 h-2 rounded-full transition-all duration-200"
                      style={{ backgroundColor: "var(--color-blue)" }}
                    />
                  )}
                </div>
              )}
            </div>

            {form.plate && (
              <p
                className="text-xs mt-1"
                style={{
                  color: vehicleInside
                    ? "var(--color-blue)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "var(--color-blue)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-text-secondary)"
                    : "var(--color-blue)",
                }}
              >
                {vehicleInside
                  ? `Vehículo dentro desde ${new Date(
                      vehicleInside.entryTime
                    ).toLocaleString("es-CO")}`
                  : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                  ? "Vehículo registrado anteriormente - Datos autocompletados"
                  : hasValidMonthly
                  ? "Vehículo con mensualidad vigente - Acceso restringido"
                  : hasValidDaily
                  ? "Vehículo con pago diario vigente - Acceso restringido"
                  : "Vehículo nuevo - Complete los datos"}
              </p>
            )}
          </div>

          {/* Tipo y Marca */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text-dark)" }}
              >
                Tipo de Vehículo
              </label>
              <div className="relative w-full">
                <select
                  value={form.type}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      type: e.target.value as "carro" | "moto",
                    }))
                  }
                  disabled={shouldDisableFields}
                  className="w-full border rounded-md px-3 py-2 pr-8 focus:outline-none transition-all duration-200 appearance-none"
                style={{
                  color: "var(--color-black)", // 🔹 texto negro
                  backgroundColor: vehicleInside
                    ? "rgba(58, 134, 255, 0.1)"
                      : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                      ? "rgba(58, 134, 255, 0.1)"
                      : hasValidMonthly || hasValidDaily
                      ? "var(--color-gray-light)"
                      : "var(--color-white)",
                  borderColor: vehicleInside
                    ? "var(--color-blue)"
                      : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                      ? "var(--color-blue)"
                      : hasValidMonthly || hasValidDaily
                      ? "var(--color-gray-dark)"
                      : "var(--color-gray-dark)",
                }}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                >
                  <option value="carro">Carro</option>
                  <option value="moto">Moto</option>
                </select>

                <svg
                  className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="var(--color-black)"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 9l6 6 6-6"
                  />
                </svg>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: "var(--color-text-dark)" }}
              >
                Marca
              </label>
              <input
                type="text"
                value={form.brand}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, brand: e.target.value }))
                }
                placeholder="Ej: Yamaha"
                disabled={shouldDisableFields}
                className="w-full border rounded-md px-3 py-2 focus:outline-none transition-all duration-200"
                style={{
                  color: "var(--color-black)",
                  backgroundColor: vehicleInside
                    ? "rgba(58, 134, 255, 0.1)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "rgba(58, 134, 255, 0.1)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-gray-light)"
                    : "var(--color-white)",
                  borderColor: vehicleInside
                    ? "var(--color-blue)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "var(--color-blue)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-gray-dark)"
                    : "var(--color-gray-dark)",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
                required
              />
            </div>
          </div>

          {/* Checkbox sección */}
          <div className="space-y-3 ">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.monthly}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    monthly: e.target.checked,
                    daily: false,
                    event: false,
                  }))
                }
                className="h-4 w-4 rounded"
                style={{
                  borderColor: "var(--color-gray-dark)",
                  accentColor: "var(--color-black)",
                }}
              />
              <label
                className="text-sm"
                style={{
                  color:
                    vehicleInside || shouldDisableFields
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-dark)",
                }}
              >
                Mensualidad
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.daily}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    daily: e.target.checked,
                    monthly: false,
                    event: false,
                  }))
                }
                className="h-4 w-4 rounded"
                style={{
                  borderColor: "var(--color-gray-dark)",
                  accentColor: "var(--color-black)",
                }}
              />
              <label
                className="text-sm"
                style={{
                  color:
                    vehicleInside || shouldDisableFields
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-dark)",
                }}
              >
                Pago Diario
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.event}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    event: e.target.checked,
                    monthly: false,
                    daily: false,
                  }))
                }
                disabled={!eventActiveToday || !!vehicleInside || hasValidMonthly || hasValidDaily}
                className="h-4 w-4 rounded"
                style={{
                  borderColor: "var(--color-gray-dark)",
                  accentColor: "var(--color-black)",
                }}
              />
              <label
                className="text-sm"
                style={{
                  color:
                    vehicleInside || !eventActiveToday || hasValidMonthly || hasValidDaily
                      ? "var(--color-text-secondary)"
                      : "var(--color-text-dark)",
                }}
              >
                Día especial / Evento
              </label>
            </div>
          </div>

          <label
            className="block text-sm font-medium mb-1"
            style={{ color: "var(--color-text-dark)" }}
          >
            Precio a Pagar
          </label>
          <div className="flex items-center justify-between gap-2.5">
            {/* Precio */}
            <div className="flex-1">
              <input
                type="text"
                value={
                  calculatedPrice > 0
                    ? `$${calculatedPrice.toLocaleString("es-CO")}`
                    : ""
                }
                readOnly
                placeholder="$$$$"
                className="w-full h-full border rounded-md px-3 py-2 font-semibold text-lg text-center focus:outline-none transition-all duration-200"
                style={{
                  color: "var(--color-black)",
                  backgroundColor: vehicleInside
                    ? "rgba(58, 134, 255, 0.1)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "rgba(58, 134, 255, 0.1)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-gray-light)"
                    : "var(--color-white)",
                  borderColor: vehicleInside
                    ? "var(--color-blue)"
                    : vehicleInRegistry && !hasValidMonthly && !hasValidDaily
                    ? "var(--color-blue)"
                    : hasValidMonthly || hasValidDaily
                    ? "var(--color-gray-dark)"
                    : "var(--color-gray-dark)",
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>

            {/* Botón */}
            <div className="flex items-center">
              <button
                type="submit"
                className="px-6 py-2 font-medium rounded-md transition transform hover:scale-105"
                style={{
                  backgroundColor: "white",
                  color: "var(--color-blue)",
                  border: `1px solid var(--color-blue)`,
                }}
                onFocus={handleFocus}
                onBlur={handleBlur}
              >
                {vehicleInside ? "Registrar salida" : "Registrar entrada"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default VehicleForm;
