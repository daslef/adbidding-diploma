"use client"

import * as React from "react"

const TOAST_REMOVE_DELAY = 5000

type ToastActionElement = React.ReactNode

export type Toast = {
  id: string
  title?: string
  description?: string
  action?: ToastActionElement
  variant?: "default" | "destructive"
}

interface ToasterToast extends Toast {
  position?: "top-right" | "top-center" | "top-left" | "bottom-right" | "bottom-center" | "bottom-left"
}

type ToastContextType = {
  toasts: ToasterToast[]
  toast: (props: Omit<ToasterToast, "id">) => string
  dismiss: (toastId: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = React.useCallback(
    ({ ...props }: Omit<ToasterToast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9)

      setToasts((prev) => [...prev, { id, ...props }])

      return id
    },
    []
  )

  const dismiss = React.useCallback((toastId: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== toastId))
  }, [])

  // Automatically dismiss toasts after delay
  React.useEffect(() => {
    const interval = setInterval(() => {
      setToasts((toasts) => toasts.slice(1))
    }, TOAST_REMOVE_DELAY)

    return () => clearInterval(interval)
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }

  return context
}