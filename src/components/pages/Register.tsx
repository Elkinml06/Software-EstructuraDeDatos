import { FC } from "react";
import Header from "../common/header";
import Hero from "./Register/dateTimeHeader";
import Vehicle from "./Register/access";

interface RegisterProps {
  onLogout: () => void;
}

const Register: FC<RegisterProps> = ({ onLogout }) => {
  return (
    <>
      <Header onLogout={onLogout} />
      <Hero />
      <Vehicle />
    </>
  );
};

export default Register;
