import { FC } from "react";

interface EditCashModalProps {
  mostrarModal: boolean;
  clave: string;
  autorizado: boolean;
  nuevoMonto: string;
  onClaveChange: (clave: string) => void;
  onNuevoMontoChange: (monto: string) => void;
  onVerificarClave: () => void;
  onGuardarMonto: () => void;
  onCerrarModal: () => void;
}

const EditCashModal: FC<EditCashModalProps> = ({
  mostrarModal,
  clave,
  autorizado,
  nuevoMonto,
  onClaveChange,
  onNuevoMontoChange,
  onVerificarClave,
  onGuardarMonto,
  onCerrarModal,
}) => {
  if (!mostrarModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Modificar dinero en caja
        </h3>

        {!autorizado ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Ingresa la clave para poder modificar la cantidad en caja:
            </p>
            <input
              type="password"
              placeholder="Clave"
              value={clave}
              onChange={(e) => onClaveChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: "var(--color-gray-50)", borderColor: "var(--color-gray-200)", color: "var(--color-black)", outline: "none" }}
              onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--border-dark-blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-blue-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--color-gray-200)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <button
              onClick={onVerificarClave}
              className="w-full py-2 rounded-md transition"
              style={{ backgroundColor: "var(--color-blue)", color: "var(--color-white)" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-blue-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-blue)"; }}
            >
              Verificar clave
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Nuevo monto en caja:</p>
            <input
              type="number"
              placeholder="Ej: 150000"
              value={nuevoMonto}
              onChange={(e) => onNuevoMontoChange(e.target.value)}
              className="w-full border rounded-md px-3 py-2"
              style={{ backgroundColor: "var(--color-gray-50)", borderColor: "var(--color-gray-200)", color: "var(--color-black)", outline: "none" }}
              onFocus={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--border-dark-blue)"; e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-blue-soft)"; }}
              onBlur={(e) => { e.currentTarget.style.outline = "none"; e.currentTarget.style.borderColor = "var(--color-gray-200)"; e.currentTarget.style.boxShadow = "none"; }}
            />
            <button
              onClick={onGuardarMonto}
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600 transition"
            >
              Guardar cambios
            </button>
          </div>
        )}

        <button
          onClick={onCerrarModal}
          className="mt-4 w-full text-sm text-gray-500 hover:underline"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditCashModal;