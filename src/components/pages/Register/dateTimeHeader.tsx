import { FC, useState, useEffect } from "react";
import { Calendar, Clock } from "lucide-react";

const DateTimeHeader: FC = () => {
  const [dateTime, setDateTime] = useState({ date: "", time: "" });

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setDateTime({
        date: now.toLocaleDateString("es-ES", {
          weekday: "long",
          day: "numeric",
          month: "long",
        }),
        time: now.toLocaleTimeString("es-ES", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        }),
      });
    };

    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, []);

  const Item: FC<{ icon: JSX.Element; text: string }> = ({ icon, text }) => (
    <div className="flex items-center gap-2">
      {icon}
      <span
        className="capitalize font-medium"
        style={{ color: "var(--color-text-dark)" }}
      >
        {text}
      </span>
    </div>
  );

  return (
    <div
      className="py-4 border-b"
      style={{
        backgroundColor: "var(--color-white)",
        borderColor: "var(--color-gray-light)",
        marginTop: 64, // para alinearse con el header fijo
      }}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center text-sm">
        <Item
          icon={
            <Calendar
              className="w-5 h-5"
              style={{ color: "var(--color-blue)" }}
            />
          }
          text={dateTime.date}
        />
        <Item
          icon={
            <Clock
              className="w-5 h-5"
              style={{ color: "var(--color-blue)" }}
            />
          }
          text={dateTime.time}
        />
      </div>
    </div>
  );
};

export default DateTimeHeader;
