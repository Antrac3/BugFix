import { Toast, ToastProvider, ToastViewport } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import {
  CheckCircle,
  AlertCircle,
  XCircle,
  Info,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface EnhancedToastProps {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info" | "loading";
  action?: React.ReactNode;
  duration?: number;
  important?: boolean;
}

const toastIcons = {
  default: Info,
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
  loading: Loader2,
};

const toastColors = {
  default: "border-border bg-background text-foreground",
  success:
    "border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100",
  error:
    "border-red-500 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100",
  warning:
    "border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-950 dark:text-yellow-100",
  info: "border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-950 dark:text-blue-100",
  loading: "border-fantasy-primary bg-fantasy-primary/5 text-fantasy-primary",
};

export function EnhancedToast({
  id,
  title,
  description,
  variant = "default",
  action,
  duration = 5000,
  important = false,
}: EnhancedToastProps) {
  const { settings, isReducedMotion } = useAccessibility();
  const Icon = toastIcons[variant];

  return (
    <Toast
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-4 pr-8 shadow-lg transition-all",
        toastColors[variant],
        isReducedMotion ? "transition-none" : "transition-all duration-300",
        important && "ring-2 ring-offset-2 ring-current",
        settings.compactMode && "p-3 text-sm",
      )}
      duration={important ? duration * 2 : duration}
    >
      <div className="flex items-start space-x-3">
        <Icon
          className={cn(
            "mt-0.5 h-5 w-5 flex-shrink-0",
            variant === "loading" && "animate-spin",
            isReducedMotion && variant === "loading" && "animate-none",
          )}
          aria-hidden="true"
        />
        <div className="grid gap-1">
          {title && (
            <div
              className="text-sm font-semibold"
              role="alert"
              aria-live={important ? "assertive" : "polite"}
            >
              {title}
            </div>
          )}
          {description && (
            <div
              className="text-sm opacity-90"
              aria-live={important ? "assertive" : "polite"}
            >
              {description}
            </div>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </Toast>
  );
}

export function EnhancedToaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <EnhancedToast
            key={id}
            id={id}
            title={title}
            description={description}
            action={action}
            variant={variant as any}
            {...props}
          />
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

// Enhanced toast hook with ergonomic improvements
export function useEnhancedToast() {
  const { toast } = useToast();
  const { settings } = useAccessibility();

  const showToast = (
    message: string,
    variant: "success" | "error" | "warning" | "info" | "loading" = "info",
    options?: {
      title?: string;
      duration?: number;
      important?: boolean;
      action?: React.ReactNode;
    },
  ) => {
    // Adjust duration based on accessibility settings
    const baseDuration = options?.duration || 5000;
    const adjustedDuration = settings.screenReader
      ? baseDuration * 1.5 // Give more time for screen readers
      : baseDuration;

    toast({
      title: options?.title,
      description: message,
      variant: variant as any,
      duration: adjustedDuration,
      action: options?.action,
      ...options,
    });

    // Announce to screen readers
    if (
      settings.screenReader &&
      (variant === "success" || variant === "error")
    ) {
      const announcement = document.createElement("div");
      announcement.setAttribute("aria-live", "assertive");
      announcement.setAttribute("aria-atomic", "true");
      announcement.className = "sr-only";
      announcement.textContent = `${options?.title || ""} ${message}`;
      document.body.appendChild(announcement);

      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }
  };

  return {
    success: (message: string, options?: Parameters<typeof showToast>[2]) =>
      showToast(message, "success", options),
    error: (message: string, options?: Parameters<typeof showToast>[2]) =>
      showToast(message, "error", { important: true, ...options }),
    warning: (message: string, options?: Parameters<typeof showToast>[2]) =>
      showToast(message, "warning", options),
    info: (message: string, options?: Parameters<typeof showToast>[2]) =>
      showToast(message, "info", options),
    loading: (message: string, options?: Parameters<typeof showToast>[2]) =>
      showToast(message, "loading", { duration: 0, ...options }),
  };
}
