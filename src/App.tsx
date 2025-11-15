import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";

// Páginas
import Login from "./components/pages/login";
import Register from "./components/pages/Register";
import Cash from "./components/pages/cash";
import Vehicles from "./components/pages/vehicles";
import Configuration from "./components/pages/configuration";

const App = () => {
  const { login, logout, isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (username: string, password: string): boolean => {
    const success = login(username, password);
    if (success) {
      navigate("/registro"); // ✅ corregido (coincide con el path)
    }
    return success;
  };

  return (
    <Routes>
      {/* Login */}
      <Route path="/" element={<Login onLogin={handleLogin} />} />

      {/* Rutas protegidas */}
      {isLoggedIn && (
        <>
          <Route path="/registro" element={<Register onLogout={logout} />} />
          <Route path="/vehiculos" element={<Vehicles onLogout={logout} />} />
          <Route path="/caja" element={<Cash onLogout={logout} />} />
          <Route path="/configuracion" element={<Configuration onLogout={logout} />} />
        </>
      )}
    </Routes>
  );
};

export default App;
