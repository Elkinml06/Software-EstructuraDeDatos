import { FC } from "react";

interface RateInputProps {
  label: string;
  value: number;
  isEditing: boolean;
  onChange: (value: string) => void;
}

const RateInput: FC<RateInputProps> = ({ label, value, isEditing, onChange }) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2" style={{ color: "var(--color-gray-700)" }}>{label}</label>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        readOnly={!isEditing}
        min="0"
        step="100"
        className="w-full px-4 py-3 rounded-lg border font-medium transition-colors"
        style={{
          backgroundColor: "var(--color-gray-50)",
          color: "var(--color-black)",
          borderColor: isEditing ? "var(--color-gray-200)" : "var(--color-gray-200)",
          opacity: isEditing ? 1 : 0.7,
          cursor: isEditing ? "text" as const : "not-allowed" as const,
          outline: "none",
        }}
        onFocus={(e) => {
          if (!isEditing) return;
          e.currentTarget.style.outline = "none";
          e.currentTarget.style.borderColor = "var(--color-blue)";
          e.currentTarget.style.boxShadow = "0 0 0 3px var(--color-blue-soft)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.outline = "none";
          e.currentTarget.style.borderColor = "var(--color-gray-200)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </div>
  );
};

export default RateInput;