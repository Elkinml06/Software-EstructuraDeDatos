import { useRef, useState } from "react";

interface LoginFormProps {
  onLogin: (username: string, password: string) => boolean;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<{ text: string; type: "error" | "info" } | null>(null);
  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const showMessage = (text: string, type: "error" | "info" = "error") => {
    // Mensaje persistente hasta que el usuario empiece a escribir
    setMessage({ text, type });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validación de obligatorios
    if (!username.trim() || !password.trim()) {
      showMessage("Ambos campos son obligatorios", "error");
      if (!username.trim()) {
        usernameRef.current?.focus();
      } else {
        passwordRef.current?.focus();
      }
      return;
    }

    const success = onLogin(username, password);
    if (success) {
      setMessage(null);
    } else {
      // Al fallar credenciales: limpiar ambos campos y enfocar usuario
      setUsername("");
      setPassword("");
      usernameRef.current?.focus();
      showMessage("Usuario o contraseña incorrectos", "error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-2xl shadow-md p-8 flex flex-col gap-6"
      >
        <h2 className="text-3xl font-bold text-center text-gray-900">
          Iniciar Sesión
        </h2>

        {message && (
          <p
            role="status"
            aria-live="polite"
            className={`${message.type === "error" ? "text-red-600" : "text-gray-700"} text-sm text-center transition-opacity`}
          >
            {message.text}
          </p>
        )}

        <input
          type="text"
          placeholder="Usuario"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 placeholder-gray-400 transition"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value);
            if (message) setMessage(null);
          }}
          ref={usernameRef}
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-800 placeholder-gray-400 transition"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (message) setMessage(null);
          }}
          ref={passwordRef}
        />

        <button
          type="submit"
          className=" text-white py-3 rounded-lg font-medium hover:bg-black transition"
          style={{backgroundColor: "var(--color-black)",}}
        >
          Entrar
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
