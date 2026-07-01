import toast, { type ToastOptions } from 'react-hot-toast';

const defaultOptions: ToastOptions = {
  duration: 4000,
  position: 'top-right',
};

export const showToast = {
  success: (message: string, options?: ToastOptions) =>
    toast.success(message, { ...defaultOptions, ...options }),

  error: (message: string, options?: ToastOptions) =>
    toast.error(message, { ...defaultOptions, ...options }),

  loading: (message: string, options?: ToastOptions) =>
    toast.loading(message, { ...defaultOptions, ...options }),

  info: (message: string, options?: ToastOptions) =>
    toast(message, { ...defaultOptions, ...options, icon: 'ℹ️' }),

  warning: (message: string, options?: ToastOptions) =>
    toast(message, { ...defaultOptions, ...options, icon: '⚠️', style: { borderLeft: '4px solid #f59e0b' } }),

  promise: <T,>(
    promise: Promise<T>,
    messages: { loading: string; success: string; error: string }
  ) =>
    toast.promise(promise, messages, defaultOptions),

  dismiss: (toastId?: string) => {
    if (toastId) toast.dismiss(toastId);
    else toast.dismiss();
  },
};

/**
 * Extrai mensagem de erro de uma resposta da API (Axios)
 */
export const getErrorMessage = (error: unknown, fallback = 'Ocorreu um erro inesperado'): string => {
  if (typeof error === 'string') return error;

  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { error?: string; message?: string } } };
    return axiosError.response?.data?.error || axiosError.response?.data?.message || fallback;
  }

  if (error && typeof error === 'object' && 'message' in error) {
    const e = error as { message: string };
    if (e.message && e.message !== 'Network Error') return e.message;
  }

  return fallback;
};

/**
 * Hook helper para usar toasts de forma mais ergonômica
 */
export const useToast = () => {
  return {
    ...showToast,
    success: showToast.success,
    error: (error: unknown, fallback?: string) => showToast.error(getErrorMessage(error, fallback)),
  };
};
