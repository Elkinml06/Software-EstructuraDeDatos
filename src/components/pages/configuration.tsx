import { FC } from "react";
import ConfigurationDashboard from "./Configuration/configurationDashboard";

interface ConfigurationProps {
  onLogout: () => void;
}

const Configuration: FC<ConfigurationProps> = (props) => {
  return <ConfigurationDashboard {...props} />;
};

export default Configuration;
