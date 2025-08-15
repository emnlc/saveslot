import { useEffect } from "react";

type Props = {
  message: string;
  setMessage: (message: string) => void;
  isToastVisible: boolean;
  setIsToastVisible: (visible: boolean) => void;
};

const Toast = ({
  message,
  setMessage,
  isToastVisible,
  setIsToastVisible,
}: Props) => {
  useEffect(() => {
    if (message) {
      setIsToastVisible(true);
      const timer = setTimeout(() => {
        setIsToastVisible(false);
        setTimeout(() => setMessage(""), 400);
      }, 15000);

      return () => clearTimeout(timer);
    }
  }, [message, setIsToastVisible, setMessage]);

  return (
    <>
      <div
        className={`toast toast-end text-sm absolute right-4 bottom-4 ${
          isToastVisible ? "toast-animate-enter" : "toast-animate-exit"
        }`}
      >
        <div
          className={`alert ${
            message.includes("Error") || message.includes("do not match")
              ? "alert-error"
              : "bg-success text-accent-content"
          }`}
        >
          <span className="text-xs md:text-sm">{message}</span>
        </div>
      </div>
    </>
  );
};

export default Toast;
