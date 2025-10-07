import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAccessibility } from "@/contexts/AccessibilityContext";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success: "bg-green-600 text-white hover:bg-green-700",
        warning: "bg-yellow-600 text-white hover:bg-yellow-700",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-12 rounded-md px-10 text-base",
        icon: "h-10 w-10",
        "icon-sm": "h-8 w-8",
        "icon-lg": "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  tooltip?: string;
  confirmAction?: boolean;
  confirmMessage?: string;
}

const EnhancedButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      loading = false,
      loadingText,
      icon,
      iconPosition = "left",
      tooltip,
      confirmAction = false,
      confirmMessage = "Sei sicuro di voler procedere?",
      disabled,
      onClick,
      children,
      ...props
    },
    ref,
  ) => {
    const { settings, isReducedMotion } = useAccessibility();
    const [isConfirming, setIsConfirming] = React.useState(false);
    const [isPressed, setIsPressed] = React.useState(false);

    // Adjust size based on accessibility settings
    const adjustedSize = React.useMemo(() => {
      if (settings.compactMode && size === "default") return "sm";
      if (settings.fontSize === "large" && size === "default") return "lg";
      if (settings.fontSize === "xl" && size === "default") return "xl";
      return size;
    }, [settings.compactMode, settings.fontSize, size]);

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) return;

      if (confirmAction && !isConfirming) {
        event.preventDefault();
        setIsConfirming(true);

        // Auto-reset confirmation after 3 seconds
        setTimeout(() => setIsConfirming(false), 3000);
        return;
      }

      setIsConfirming(false);

      // Haptic feedback for mobile devices
      if ("vibrate" in navigator && !isReducedMotion) {
        navigator.vibrate(50);
      }

      // Visual feedback
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);

      onClick?.(event);
    };

    const buttonContent = (
      <>
        {loading && (
          <Loader2
            className={cn(
              "h-4 w-4",
              isReducedMotion ? "" : "animate-spin",
              (children || loadingText) && "mr-2",
            )}
            aria-hidden="true"
          />
        )}

        {!loading && icon && iconPosition === "left" && (
          <span
            className={cn("h-4 w-4", children && "mr-2")}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {loading ? loadingText || children : children}

        {!loading && icon && iconPosition === "right" && (
          <span
            className={cn("h-4 w-4", children && "ml-2")}
            aria-hidden="true"
          >
            {icon}
          </span>
        )}

        {isConfirming && (
          <span className="ml-2 text-xs opacity-75" aria-live="polite">
            (Clicca di nuovo per confermare)
          </span>
        )}
      </>
    );

    const Comp = asChild ? Slot : "button";

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size: adjustedSize, className }),
          // Enhanced focus styles
          settings.focusIndicator === "enhanced" &&
            "focus-visible:ring-4 focus-visible:ring-offset-4",
          // High contrast adjustments
          settings.contrast === "high" && [
            "border-2 border-current",
            variant === "outline" && "border-4",
          ],
          // Animation adjustments
          isReducedMotion
            ? "transition-none"
            : "transition-all duration-200 ease-in-out",
          // Touch-friendly sizing
          "min-h-[44px] min-w-[44px]",
          isPressed && !isReducedMotion && "scale-95",
          isConfirming && "ring-2 ring-yellow-400 ring-offset-2",
        )}
        ref={ref}
        disabled={disabled || loading}
        onClick={handleClick}
        title={tooltip}
        aria-busy={loading}
        aria-describedby={tooltip ? `${props.id}-tooltip` : undefined}
        data-confirming={isConfirming}
        {...props}
      >
        {buttonContent}
      </Comp>
    );
  },
);

EnhancedButton.displayName = "EnhancedButton";

export { EnhancedButton, buttonVariants };

// High-level action buttons with built-in feedback
export const SaveButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "variant">
>((props, ref) => (
  <EnhancedButton
    ref={ref}
    variant="default"
    icon={props.loading ? undefined : "💾"}
    loadingText="Salvando..."
    {...props}
  />
));

export const DeleteButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "variant" | "confirmAction">
>((props, ref) => (
  <EnhancedButton
    ref={ref}
    variant="destructive"
    confirmAction
    confirmMessage="Sei sicuro di voler eliminare questo elemento?"
    icon="🗑️"
    {...props}
  />
));

export const SubmitButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "type">
>((props, ref) => (
  <EnhancedButton ref={ref} type="submit" icon="✓" {...props} />
));

export const CancelButton = React.forwardRef<
  HTMLButtonElement,
  Omit<ButtonProps, "variant">
>((props, ref) => (
  <EnhancedButton ref={ref} variant="outline" icon="✕" {...props} />
));
