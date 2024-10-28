import { toast, ToastT } from 'sonner'
import { Error, Success } from '@/components/custom/icons'

type ToastType = 'success' | 'error'

type ToastStyles = {
  backgroundColor: string
  color: string
  border: string
}

type ToastFunctions = {
  success: (message: string, options?: Omit<ToastT, 'message'>) => void
  error: (message: string, options?: Omit<ToastT, 'message'>) => void
}

const toastStyles: Record<ToastType, ToastStyles> = {
  success: {
    backgroundColor: '#F0FAF0',
    color: '#367E18',
    border: '1px solid #367E18'
  },
  error: {
    backgroundColor: '#FDE7E7',
    color: '#C53030',
    border: '1px solid #C53030'
  }
}

/**
 * Custom Toast Hook
 * @returns {
 *          success: (message: string, options?: Omit<ToastT, "message">) => void;
 *          error: (message: string, options?: Omit<ToastT, "message">) => void;
 *        } - Toast functions
 */
export function useToast(): ToastFunctions {
  const showToast = (message: string, type: ToastType, options?: Omit<ToastT, 'message'>) => {
    const Icon = type === 'success' ? Success : Error

    const toastContent = (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon className='w-5 h-5' />
        <span>{message}</span>
      </div>
    )

    toast(toastContent, {
      ...options,
      style: {
        ...toastStyles[type],
        gap: '1.5rem',
        textAlign: 'justify'
      },
      className: 'ltr rtl:rtl select-none',
      position: 'bottom-center'
      // duration: 60000
    })
  }

  return {
    success: (message: string, options?: Omit<ToastT, 'message'>) =>
      showToast(message, 'success', options),
    error: (message: string, options?: Omit<ToastT, 'message'>) =>
      showToast(message, 'error', options)
  }
}
