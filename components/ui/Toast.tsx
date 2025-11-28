'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Alert from './Alert'

export interface Toast {
  id: string
  message: string
  variant?: 'error' | 'success' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  showToast: (message: string, variant?: Toast['variant'], duration?: number) => void
  removeToast: (id: string) => void
}

// 전역 Toast 관리
let toastId = 0
let toastListeners: ((toasts: Toast[]) => void)[] = []
let globalToasts: Toast[] = []

const notifyListeners = () => {
  toastListeners.forEach((listener) => listener([...globalToasts]))
}

export const toast = {
  show: (message: string, variant: Toast['variant'] = 'info', duration = 3000) => {
    const id = `toast-${toastId++}`
    const newToast: Toast = { id, message, variant, duration }
    globalToasts = [...globalToasts, newToast]
    notifyListeners()

    if (duration > 0) {
      setTimeout(() => {
        toast.remove(id)
      }, duration)
    }
  },
  success: (message: string, duration = 3000) => toast.show(message, 'success', duration),
  error: (message: string, duration = 3000) => toast.show(message, 'error', duration),
  warning: (message: string, duration = 3000) => toast.show(message, 'warning', duration),
  info: (message: string, duration = 3000) => toast.show(message, 'info', duration),
  remove: (id: string) => {
    globalToasts = globalToasts.filter((t) => t.id !== id)
    notifyListeners()
  },
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (newToasts: Toast[]) => {
      setToasts(newToasts)
    }
    toastListeners.push(listener)
    setToasts([...globalToasts])

    return () => {
      toastListeners = toastListeners.filter((l) => l !== listener)
    }
  }, [])

  return (
    <div className="fixed top-20 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            transition={{ duration: 0.2 }}
          >
            <Alert variant={toast.variant} className="shadow-lg">
              <div className="flex items-center justify-between">
                <span>{toast.message}</span>
                <button
                  onClick={() => toast.remove(toast.id)}
                  className="ml-4 text-current opacity-70 hover:opacity-100 transition-opacity"
                  aria-label="닫기"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

