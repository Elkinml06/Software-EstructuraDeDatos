import { FC } from "react";

interface WithdrawCashModalProps {
  mostrar: boolean;
  monto: string;
  nota: string;
  onMontoChange: (monto: string) => void;
  onNotaChange: (nota: string) => void;
  onConfirmar: () => void;
  onCerrar: () => void;
}

const WithdrawCashModal: FC<WithdrawCashModalProps> = ({
  mostrar,
  monto,
  nota,
  onMontoChange,
  onNotaChange,
  onConfirmar,
  onCerrar,
}) => {
  if (!mostrar) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Entregar dinero</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Monto a retirar:</p>
            <input
              type="number"
              placeholder="Ej: 20000"
              value={monto}
              onChange={(e) => onMontoChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: "var(--color-gray-50)", borderColor: "var(--color-gray-200)", color: "var(--color-black)", outline: "none" }}
              onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--border-dark-blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-blue-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--color-gray-200)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <div>
            <p className="text-sm text-gray-600">Nota (opcional):</p>
            <input
              type="text"
              placeholder="Motivo del retiro"
              value={nota}
              onChange={(e) => onNotaChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: "var(--color-gray-50)", borderColor: "var(--color-gray-200)", color: "var(--color-black)", outline: "none" }}
              onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--border-dark-blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-blue-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--color-gray-200)"; e.currentTarget.style.boxShadow = "none"; }}
            />
          </div>
          <button
            onClick={onConfirmar}
            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 transition"
          >
            Confirmar retiro
          </button>
          <button
            onClick={onCerrar}
            className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition mt-2"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default WithdrawCashModal;