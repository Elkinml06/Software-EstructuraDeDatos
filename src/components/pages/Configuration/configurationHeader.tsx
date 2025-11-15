import { FC } from "react";
import { Edit3, Save } from "lucide-react";

interface ConfigurationHeaderProps {
  isEditing: boolean;
  onToggleEdit: () => void;
}

const ConfigurationHeader: FC<ConfigurationHeaderProps> = ({
  isEditing,
  onToggleEdit,
}) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-bold text-black">Configuración</h1>
      <button
        onClick={onToggleEdit}
        className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all"
        style={{ backgroundColor: "var(--color-blue)", color: "var(--color-white)" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--color-blue-hover)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--color-blue)"; }}
      >
        {isEditing ? (
          <>
            <Save size={18} />
            Guardar
          </>
        ) : (
          <>
            <Edit3 size={18} />
            Editar
          </>
        )}
      </button>
    </div>
  );
};

export default ConfigurationHeader;