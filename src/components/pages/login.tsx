import { FC } from "react";
import LoginForm from "./login/loginForm";

interface LoginProps {
  onLogin: (username: string, password: string) => void;
}

const Login: FC<LoginProps> = ({ onLogin }) => {
  return (
    <>
      {/* Formulario */}
      <LoginForm onLogin={(username, password) => {
        onLogin(username, password);
        return true;
      }} />
    </>
  );
};

export default Login;
