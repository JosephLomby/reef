import { useEffect } from "react"
import { toastColors } from "../../../styles/index"

const Toast = ({ message, type, onDismiss }) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div className={`fixed bottom-6 right-6 z-50 px-6 py-3.5 rounded-2xl shadow-2xl ${toastColors[type]} text-sm font-medium flex items-center gap-3`}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 opacity-60 hover:opacity-100">✕</button>
    </div>
  )
}

export default Toast