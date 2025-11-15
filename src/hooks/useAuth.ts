import { useState } from "react";

export const useAuth = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const USER = "admin";
  const PASSWORD = "1234";

  const login = (username: string, password: string): boolean => {
    if (username === USER && password === PASSWORD) {
      setIsLoggedIn(true);
      return true;
    } else {
      alert("Usuario o contraseña incorrectos");
      return false;
    }
  };

  const logout = () => setIsLoggedIn(false);

  return { isLoggedIn, login, logout };
};
