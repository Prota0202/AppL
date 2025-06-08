// Toast.tsx
import { createSignal, createContext, useContext, onMount, onCleanup, JSX, Component, createEffect, Show } from 'solid-js';

import './toast.css'; // Assurez-vous de créer un fichier CSS séparé pour les animations
import { Portal } from 'solid-js/web';

// Définition des types
export type ToastType =
  | 'success'
  | 'error'
  | 'warning'
  | 'info'
  | 'achievement'
  | 'levelUp'
  | 'reward'
  | 'quest';

export type AnimationType =
  | 'slide'
  | 'fade'
  | 'bounce'
  | 'pulse';

export interface ToastOptions {
  type?: ToastType;
  duration?: number;
  title?: string;
  icon?: JSX.Element;
  details?: string;
  animationType?: AnimationType;
  onClose?: () => void;
}

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  title: string;
  icon?: JSX.Element;
  details?: string | null;
  animationType: AnimationType;
  onClose?: () => void;
}

export interface ToastContextValue {
  toasts: () => Toast[];
  addToast: (message: string, options?: ToastOptions) => string;
  dismissToast: (id: string) => void;
  success: (message: string, options?: ToastOptions) => string;
  error: (message: string, options?: ToastOptions) => string;
  warning: (message: string, options?: ToastOptions) => string;
  info: (message: string, options?: ToastOptions) => string;
  achievement: (message: string, options?: ToastOptions) => string;
  levelUp: (message: string, options?: ToastOptions) => string;
  reward: (message: string, options?: ToastOptions) => string;
  quest: (message: string, options?: ToastOptions) => string;
}

interface ToastProviderProps {
  children: JSX.Element;
}

interface ToastContainerProps {
  toasts: () => Toast[];
  dismissToast: (id: string) => void;
}

interface ToastProps extends Toast {
  onDismiss: () => void;
}

// Contexte pour Toast
const ToastContext = createContext<ToastContextValue>();

// Hook pour utiliser Toast
const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Fournisseur pour Toast
const ToastProvider: Component<ToastProviderProps> = (props) => {
  const [toasts, setToasts] = createSignal<Toast[]>([]);
  const [mounted, setMounted] = createSignal(false);

  onMount(() => {
    setMounted(true);
  });

  onCleanup(() => {
    setMounted(false);
  });

  // Fonction pour ajouter un toast
  const addToast = (message: string, options: ToastOptions = {}): string => {
    const id = Math.random().toString(36).substring(2, 9);
    const toast: Toast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      title: options.title || getDefaultTitle(options.type || 'info'),
      icon: options.icon,
      details: options.details || null,
      animationType: options.animationType || 'slide',
      onClose: options.onClose
    };

    setToasts((prevToasts) => [...prevToasts, toast]);

    // Suppression automatique
    if (toast.duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, toast.duration);
    }

    return id;
  };

  // Helper pour obtenir le titre par défaut selon le type
  const getDefaultTitle = (type: ToastType): string => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      case 'info': return 'Information';
      case 'achievement': return 'Achievement Unlocked';
      case 'levelUp': return 'Level Up';
      case 'reward': return 'Reward Received';
      case 'quest': return 'Quest Update';
      default: return 'Notification';
    }
  };

  // Fonction pour supprimer un toast
  const dismissToast = (id: string): void => {
    setToasts((prevToasts) => {
      const toast = prevToasts.find(t => t.id === id);
      if (toast && toast.onClose) {
        toast.onClose();
      }
      return prevToasts.filter(t => t.id !== id);
    });
  };

  // Méthodes raccourcies pour différents types de toast
  const success = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, { ...options, type: 'success' });
  };

  const error = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, { ...options, type: 'error' });
  };

  const warning = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, { ...options, type: 'warning' });
  };

  const info = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, { ...options, type: 'info' });
  };

  const achievement = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, {
      ...options,
      type: 'achievement',
      duration: options.duration || 7000,
      animationType: options.animationType || 'bounce'
    });
  };

  const levelUp = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, {
      ...options,
      type: 'levelUp',
      duration: options.duration || 7000,
      animationType: options.animationType || 'pulse'
    });
  };

  const reward = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, {
      ...options,
      type: 'reward',
      duration: options.duration || 6000
    });
  };

  const quest = (message: string, options: ToastOptions = {}): string => {
    return addToast(message, {
      ...options,
      type: 'quest',
      duration: options.duration || 6000
    });
  };

  const value: ToastContextValue = {
    toasts,
    addToast,
    dismissToast,
    success,
    error,
    warning,
    info,
    achievement,
    levelUp,
    reward,
    quest
  };

  // Utilise Portal pour monter le conteneur Toast
  return (
    <ToastContext.Provider value={value}>
      {props.children}
      {mounted() && (
        <Portal mount={document.getElementById("toast")!}>
          <ToastContainer toasts={toasts} dismissToast={dismissToast} />
        </Portal>
      )}
    </ToastContext.Provider>
  );
};

// Conteneur pour les toasts
const ToastContainer: Component<ToastContainerProps> = (props) => {
  return (
    <Show when={props.toasts().length > 0}>
      <div class="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3 max-w-md w-full">
        {props.toasts().map((toast) => (
          <Toast
            {...toast}
            onDismiss={() => props.dismissToast(toast.id)}
          />
        ))}
      </div>
    </Show>
  );
};

// Composant Toast individuel
const Toast: Component<ToastProps> = (props) => {
  const [isExiting, setIsExiting] = createSignal(false);

  // Gestion de la suppression
  const handleDismiss = (): void => {
    setIsExiting(true);
    // Ajoute un petit délai avant de réellement supprimer le toast
    setTimeout(() => {
      props.onDismiss();
    }, 300);
  };

  // Obtient la couleur de fond selon le type
  const getBgColor = (): string => {
    switch (props.type) {
      case 'success': return 'bg-green-900/85 border-l-4 border-green-500';
      case 'error': return 'bg-red-900/85 border-l-4 border-red-500';
      case 'warning': return 'bg-yellow-900/85 border-l-4 border-yellow-500';
      case 'info': return 'bg-blue-900/85 border-l-4 border-blue-500';
      case 'achievement': return 'bg-purple-900/85 border-l-4 border-purple-500';
      case 'levelUp': return 'bg-blue-900/85 border-l-4 border-blue-400';
      case 'reward': return 'bg-amber-900/85 border-l-4 border-amber-400';
      case 'quest': return 'bg-teal-900/85 border-l-4 border-teal-500';
      default: return 'bg-gray-900/85 border-l-4 border-gray-500';
    }
  };

  // Détermine l'icône selon le type
  const getIcon = (): JSX.Element => {
    if (props.icon) return props.icon;

    switch (props.type) {
      case 'success':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'info':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'achievement':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
        );
      case 'levelUp':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'reward':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        );
      case 'quest':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  // Obtient la classe d'animation selon animationType
  const getAnimationClass = (): string => {
    if (isExiting()) {
      return 'animate-fade-out';
    }

    switch (props.animationType) {
      case 'slide': return 'animate-slide-in';
      case 'fade': return 'animate-fade-in';
      case 'bounce': return 'animate-bounce-in';
      case 'pulse': return 'animate-pulse-in';
      default: return 'animate-slide-in';
    }
  };

  return (
    <div
      class={`flex ${getBgColor()} backdrop-blur-sm shadow-lg rounded-md overflow-hidden max-w-md w-full ${getAnimationClass()}`}
      role="alert"
    >
      {/* Effets spéciaux pour certains types de toast */}
      {(props.type === 'achievement' || props.type === 'levelUp') && (
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Particules pour achievement/levelUp */}
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              class={`absolute w-1 h-1 rounded-full ${props.type === 'achievement' ? 'bg-purple-400' : 'bg-blue-400'} animate-float-particle opacity-70`}
              style={{
                "top": `${Math.random() * 100}%`,
                "left": `${Math.random() * 100}%`,
                "animation-delay": `${Math.random() * 3}s`,
                "animation-duration": `${Math.random() * 3 + 2}s`
              }}
            ></div>
          ))}
        </div>
      )}

      <div class="flex-1 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            {getIcon()}
          </div>
          <div class="ml-3 w-0 flex-1 pt-0.5">
            <p class="text-sm font-medium text-white">{props.title}</p>
            <p class="mt-1 text-sm text-gray-200">{props.message}</p>

            {props.details && (
              <div class="mt-2 p-2 bg-black/20 rounded text-xs text-gray-300">
                {props.details}
              </div>
            )}
          </div>
          <div class="ml-4 flex-shrink-0 flex">
            <button
              class="bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-200 focus:outline-none"
              onClick={handleDismiss}
            >
              <span class="sr-only">Close</span>
              <svg class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export { ToastProvider, useToast };