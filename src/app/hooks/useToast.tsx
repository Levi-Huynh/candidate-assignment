import { useCallback, useState } from "react";

export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
  }, []);

  const closeToast = useCallback(() => {
    setMessage(null);
  }, []);

  const Toast = message ? (
    <div className="fixed bottom-5 right-5 bg-red-600 text-white px-4 py-2 rounded shadow-lg z-50">
      {message}
      <button
        onClick={closeToast}
        className="ml-4 text-white font-bold"
        aria-label="Close toast"
      >
        x
      </button>
    </div>
  ) : null;

  return { showToast, Toast };
}
