import { createContext, useContext, useState, type ReactNode } from "react"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextValue {
  addToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now()
    setToasts(t => [...t, { id, message, type }])

    setTimeout(() => {
      setToasts(t => t.filter(toast => toast.id !== id))
    }, 5000)
  }

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}

      <div style={toastContainerStyle}>
        {toasts.map(t => (
          <div key={t.id} style={toastStyle(t.type)}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

const toastContainerStyle: React.CSSProperties = {
  position: "fixed",
  bottom: "20px",
  right: "20px",
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  zIndex: 9999,
}

const toastStyle = (type: ToastType): React.CSSProperties => ({
  padding: "12px 16px",
  borderRadius: "8px",
  color: "white",
  fontWeight: 600,
  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
  background:
    type === "success"
      ? "#10B981"
      : type === "error"
      ? "#EF4444"
      : type === "warning"
      ? "#F59E0B"
      : "#3B82F6",
  transition: "opacity 0.3s ease",
})
