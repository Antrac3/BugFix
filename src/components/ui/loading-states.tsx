import { useAccessibility } from "@/contexts/AccessibilityContext";
import { Loader2, Clock, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
  text,
}: LoadingSpinnerProps) {
  const { isReducedMotion } = useAccessibility();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn("flex items-center justify-center space-x-2", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2
        className={cn(
          sizeClasses[size],
          isReducedMotion ? "" : "animate-spin",
          "text-fantasy-primary",
        )}
        aria-hidden="true"
      />
      {text && (
        <span className="text-sm text-muted-foreground" aria-live="polite">
          {text}
        </span>
      )}
      <span className="sr-only">Caricamento in corso...</span>
    </div>
  );
}

interface LoadingSkeletonProps {
  className?: string;
  lines?: number;
  width?: string[];
}

export function LoadingSkeleton({
  className,
  lines = 3,
  width = ["100%", "75%", "50%"],
}: LoadingSkeletonProps) {
  const { isReducedMotion } = useAccessibility();

  return (
    <div className={cn("space-y-3", className)} role="status" aria-busy="true">
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={cn(
            "h-4 bg-muted rounded",
            isReducedMotion ? "" : "animate-pulse",
          )}
          style={{ width: width[index % width.length] }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Caricamento contenuto...</span>
    </div>
  );
}

interface LoadingCardProps {
  title?: string;
  description?: string;
  progress?: number;
  className?: string;
}

export function LoadingCard({
  title = "Caricamento in corso...",
  description,
  progress,
  className,
}: LoadingCardProps) {
  return (
    <Card className={cn("w-full max-w-md mx-auto", className)}>
      <CardContent className="p-6">
        <div className="flex items-center space-x-4 mb-4">
          <LoadingSpinner size="lg" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold">{title}</h3>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>

        {progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface LoadingOverlayProps {
  isVisible: boolean;
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingOverlay({
  isVisible,
  message = "Caricamento...",
  progress,
  className,
}: LoadingOverlayProps) {
  const { isReducedMotion } = useAccessibility();

  if (!isVisible) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-background/80 backdrop-blur-sm",
        isReducedMotion ? "" : "animate-in fade-in-0",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="loading-title"
      aria-describedby="loading-description"
    >
      <LoadingCard title={message} progress={progress} className="shadow-lg" />
    </div>
  );
}

// State indicators for different scenarios
interface StateIndicatorProps {
  state: "loading" | "success" | "error" | "pending";
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function StateIndicator({
  state,
  message,
  size = "md",
  className,
}: StateIndicatorProps) {
  const { isReducedMotion } = useAccessibility();

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const stateConfig = {
    loading: {
      icon: Loader2,
      color: "text-fantasy-primary",
      bgColor: "bg-fantasy-primary/10",
      animation: isReducedMotion ? "" : "animate-spin",
      ariaLabel: "Caricamento",
    },
    success: {
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
      animation: "",
      ariaLabel: "Completato con successo",
    },
    error: {
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      animation: "",
      ariaLabel: "Errore",
    },
    pending: {
      icon: Clock,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100",
      animation: "",
      ariaLabel: "In attesa",
    },
  };

  const config = stateConfig[state];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center space-x-2 rounded-full px-3 py-1",
        config.bgColor,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Icon
        className={cn(sizeClasses[size], config.color, config.animation)}
        aria-label={config.ariaLabel}
      />
      {message && (
        <span className={cn("text-sm font-medium", config.color)}>
          {message}
        </span>
      )}
    </div>
  );
}

// Page loading wrapper
interface PageLoadingProps {
  isLoading: boolean;
  error?: string;
  children: React.ReactNode;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
}

export function PageLoading({
  isLoading,
  error,
  children,
  loadingComponent,
  errorComponent,
}: PageLoadingProps) {
  if (error) {
    return (
      errorComponent || (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Si è verificato un errore
            </h3>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </div>
      )
    );
  }

  if (isLoading) {
    return (
      loadingComponent || (
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" text="Caricamento della pagina..." />
        </div>
      )
    );
  }

  return <>{children}</>;
}

// Form loading states
export function FormLoadingButton({
  isLoading,
  children,
  ...props
}: {
  isLoading: boolean;
  children: React.ReactNode;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      disabled={isLoading || props.disabled}
      className={cn(
        "inline-flex items-center justify-center space-x-2",
        props.className,
      )}
    >
      {isLoading && <LoadingSpinner size="sm" />}
      <span>{children}</span>
    </button>
  );
}
