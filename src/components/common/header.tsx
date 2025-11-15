import { FC } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LogOut,
  ClipboardList,
  ParkingCircle,
  Wallet,
  Settings,
} from "lucide-react";

interface HeaderProps {
  onLogout: () => void;
}

const Header: FC<HeaderProps> = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  const navItems = [
    { label: "Registro", path: "/registro", icon: ClipboardList },
    { label: "Vehículos", path: "/vehiculos", icon: ParkingCircle },
    { label: "Caja", path: "/caja", icon: Wallet },
    { label: "Configuración", path: "/configuracion", icon: Settings },
  ];

  return (
    <header
      className="fixed top-0 left-0 w-full z-50 h-16 shadow-sm border-b"
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "var(--color-gray-light)",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center h-full">
        {/* Logo */}
        <h1
          className="text-lg font-semibold select-none"
          style={{ color: "var(--color-text-dark)" }}
        >
          Parqueadero
        </h1>

        {/* Navegación */}
        <nav className="flex space-x-6">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex items-center gap-2 text-sm font-medium transition-all duration-200 border-b-2 pb-1"
                style={{
                  color: isActive
                    ? "var(--color-blue)"
                    : "var(--color-black)",
                  borderColor: isActive ? "var(--color-blue)" : "transparent",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "var(--color-black)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor =
                      "transparent";
                  }
                }}
              >
                <Icon
                  size={18}
                  style={{
                    color: isActive
                      ? "var(--color-blue)"
                      : "var(--color-black)",
                    transition: "color 0.3s ease",
                  }}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-all duration-300 ease-in-out"
          style={{
            borderColor: "var(--color-blue)",
            color: "var(--color-blue)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.backgroundColor = "var(--color-blue)";
            btn.style.color = "var(--color-white)";
            const svg = btn.querySelector("svg");
            if (svg) {
              svg.style.color = "var(--color-white)";
              svg.style.transition = "color 0.3s ease-in-out";
            }
          }}
          onMouseLeave={(e) => {
            const btn = e.currentTarget as HTMLButtonElement;
            btn.style.backgroundColor = "transparent";
            btn.style.color = "var(--color-blue)";
            const svg = btn.querySelector("svg");
            if (svg) {
              svg.style.color = "var(--color-blue)";
              svg.style.transition = "color 0.3s ease-in-out";
            }
          }}
        >
          <LogOut
            size={16}
            className="text-(--color-blue) transition-colors duration-500 ease-in-out"
          />
          Salir
        </button>
      </div>
    </header>
  );
};

export default Header;
