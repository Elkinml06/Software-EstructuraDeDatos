import { FC, useEffect, useState } from "react";
import Header from "../../common/header";
import CashSummaryCards from "./cashSummaryCards";
import MovementHistory from "./movementHistory";
import EditCashModal from "./editCashModal";
import WithdrawCashModal from "./withdrawCashModal";
import { computeCashOnHand, getWithdrawalsTotalToday, getCashStart, setCashStart, addWithdrawal } from "./cashUtils";

interface CashDashboardProps {
  dineroEnCaja?: number;
  ingresosDelDia?: number;
  entregadoHoy?: number;
  onLogout: () => void;
}

const CashDashboard: FC<CashDashboardProps> = ({ onLogout }) => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [clave, setClave] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [nuevoMonto, setNuevoMonto] = useState("");
  const [filtroActivo, setFiltroActivo] = useState("Día");
  const [dineroEnCaja, setDineroEnCaja] = useState<number>(0);
  const [entregadoHoy, setEntregadoHoy] = useState<number>(0);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [mostrarRetiro, setMostrarRetiro] = useState(false);
  const [retiroMonto, setRetiroMonto] = useState<string>("");
  const [retiroNota, setRetiroNota] = useState<string>("");
  const [retiroError, setRetiroError] = useState<string | null>(null);

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 3000);
  };

  const recomputeCash = () => {
    const totalWithdrawn = getWithdrawalsTotalToday();
    const cash = computeCashOnHand();
    setEntregadoHoy(totalWithdrawn);
    setDineroEnCaja(cash);
  };

  useEffect(() => {
    // Inicializar a partir de localStorage
    const start = getCashStart();
    setNuevoMonto(String(start.amount));
    recomputeCash();

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'incomeRecords' || e.key === 'cashWithdrawals' || e.key === 'cashStart') {
        recomputeCash();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const handleVerificarClave = () => {
    if (clave === "1234") {
      setAutorizado(true);
      showFeedback('success', 'Autorización concedida');
    } else {
      showFeedback('error', 'Clave incorrecta');
    }
  };

  const handleGuardarMonto = () => {
    const amount = Number(nuevoMonto);
    if (isNaN(amount) || amount < 0) {
      showFeedback('error', 'Monto inválido');
      return;
    }
    setCashStart(amount);
    recomputeCash();
    setMostrarModal(false);
    setClave("");
    setAutorizado(false);
    showFeedback('success', 'Monto inicial de caja actualizado');
  };

  const handleCerrarModal = () => {
    setMostrarModal(false);
    setClave("");
    setNuevoMonto("");
    setAutorizado(false);
  };

  const handleWithdrawCash = () => {
    setMostrarRetiro(true);
    setRetiroError(null);
  };

  const handleConfirmWithdraw = () => {
    const amount = Number(retiroMonto);
    if (isNaN(amount) || amount <= 0) {
      setRetiroError('Monto inválido');
      return;
    }
    const currentCash = computeCashOnHand();
    if (amount > currentCash) {
      setRetiroError('Fondos insuficientes');
      return;
    }
    const note = retiroNota && retiroNota.trim().length > 0 ? retiroNota.trim() : 'Retiro de caja';
    addWithdrawal(amount, note);
    setMostrarRetiro(false);
    setRetiroMonto("");
    setRetiroNota("");
    setRetiroError(null);
    recomputeCash();
    showFeedback('success', 'Retiro registrado');
  };

  const handleCerrarRetiro = () => {
    setMostrarRetiro(false);
    setRetiroMonto("");
    setRetiroNota("");
    setRetiroError(null);
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <Header onLogout={onLogout} />

      <div style={{ marginTop: 63.2 }}>
        <h1 className="text-2xl font-bold text-gray-900">Cierre de Caja</h1>
        <p className="text-gray-500">
          Administra los ingresos del día y los movimientos de la caja.
        </p>
      </div>

      {/* Feedback inline */}
      {feedback && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          feedback.type === 'success' ? 'bg-green-100 text-green-800' :
          feedback.type === 'error' ? 'bg-red-100 text-red-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {feedback.message}
        </div>
      )}

      {/* Sección principal */}
      <CashSummaryCards
        dineroEnCaja={dineroEnCaja}
        entregadoHoy={entregadoHoy}
        onEditCash={() => setMostrarModal(true)}
        onWithdrawCash={handleWithdrawCash}
      />

      {/* Historial */}
      <MovementHistory
        filtroActivo={filtroActivo}
        onFiltroChange={setFiltroActivo}
      />

      {/* Modal de edición */}
      <EditCashModal
        mostrarModal={mostrarModal}
        clave={clave}
        autorizado={autorizado}
        nuevoMonto={nuevoMonto}
        onClaveChange={setClave}
        onNuevoMontoChange={setNuevoMonto}
        onVerificarClave={handleVerificarClave}
        onGuardarMonto={handleGuardarMonto}
        onCerrarModal={handleCerrarModal}
      />

      <WithdrawCashModal
        mostrar={mostrarRetiro}
        monto={retiroMonto}
        nota={retiroNota}
        onMontoChange={(v) => { setRetiroMonto(v); if (retiroError) setRetiroError(null); }}
        onNotaChange={setRetiroNota}
        onConfirmar={handleConfirmWithdraw}
        onCerrar={handleCerrarRetiro}
        errorMessage={retiroError || undefined}
      />
    </div>
  );
};

export default CashDashboard;