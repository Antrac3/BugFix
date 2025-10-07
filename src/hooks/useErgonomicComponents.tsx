import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EnhancedButton } from "@/components/ui/enhanced-button";
import { LoadingSpinner, SkeletonLoader } from "@/components/ui/loading-states";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { cn } from "@/lib/utils";

export function useErgonomicComponents() {
  const { settings, isReducedMotion } = useAccessibility();

  // Enhanced Button wrapper
  const EButton = React.forwardRef<
    React.ElementRef<typeof Button>,
    React.ComponentProps<typeof Button> & {
      requireConfirmation?: boolean;
      confirmationMessage?: string;
      variant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link"
        | "primary";
    }
  >(
    (
      {
        className,
        variant,
        requireConfirmation,
        confirmationMessage,
        ...props
      },
      ref,
    ) => {
      return (
        <EnhancedButton
          ref={ref}
          className={cn(className)}
          variant={variant}
          requireConfirmation={requireConfirmation}
          confirmationMessage={confirmationMessage}
          {...props}
        />
      );
    },
  );

  // Enhanced Card wrapper
  const ECard = React.forwardRef<
    React.ElementRef<typeof Card>,
    React.ComponentProps<typeof Card>
  >(({ className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          settings.highContrast && "border-2 border-foreground/20",
          settings.compactMode && "p-4",
          !settings.compactMode && "p-6",
          className,
        )}
        {...props}
      />
    );
  });

  // Enhanced Loading component
  const ELoading = ({
    size = "medium",
    text,
    skeleton = false,
    rows = 3,
  }: {
    size?: "small" | "medium" | "large";
    text?: string;
    skeleton?: boolean;
    rows?: number;
  }) => {
    if (skeleton) {
      return <SkeletonLoader rows={rows} />;
    }
    return <LoadingSpinner size={size} text={text} />;
  };

  // Enhanced Grid component
  const EGrid = ({
    children,
    className,
    columns = "auto-fit",
    minWidth = "300px",
    ...props
  }: React.ComponentProps<"div"> & {
    columns?: string;
    minWidth?: string;
  }) => {
    return (
      <div
        className={cn("grid gap-6", settings.compactMode && "gap-4", className)}
        style={{
          gridTemplateColumns: `repeat(${columns}, minmax(${minWidth}, 1fr))`,
        }}
        {...props}
      >
        {children}
      </div>
    );
  };

  // Enhanced Text components
  const EHeading = ({
    level = 1,
    children,
    className,
    ...props
  }: React.ComponentProps<"h1"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => {
    const Tag = `h${level}` as keyof JSX.IntrinsicElements;

    const sizeClasses = {
      1: {
        large: "text-4xl",
        medium: "text-3xl",
        small: "text-2xl",
      },
      2: {
        large: "text-3xl",
        medium: "text-2xl",
        small: "text-xl",
      },
      3: {
        large: "text-2xl",
        medium: "text-xl",
        small: "text-lg",
      },
      4: {
        large: "text-xl",
        medium: "text-lg",
        small: "text-base",
      },
      5: {
        large: "text-lg",
        medium: "text-base",
        small: "text-sm",
      },
      6: {
        large: "text-base",
        medium: "text-sm",
        small: "text-xs",
      },
    };

    return React.createElement(
      Tag,
      {
        className: cn(
          "font-bold text-foreground",
          sizeClasses[level][settings.fontSize],
          className,
        ),
        ...props,
      },
      children,
    );
  };

  const EText = ({
    children,
    className,
    variant = "body",
    ...props
  }: React.ComponentProps<"p"> & {
    variant?: "body" | "caption" | "muted";
  }) => {
    const variantClasses = {
      body: {
        large: "text-lg",
        medium: "text-base",
        small: "text-sm",
      },
      caption: {
        large: "text-base",
        medium: "text-sm",
        small: "text-xs",
      },
      muted: {
        large: "text-base text-muted-foreground",
        medium: "text-sm text-muted-foreground",
        small: "text-xs text-muted-foreground",
      },
    };

    return (
      <p
        className={cn(variantClasses[variant][settings.fontSize], className)}
        {...props}
      >
        {children}
      </p>
    );
  };

  // Enhanced Section wrapper
  const ESection = ({
    title,
    description,
    children,
    className,
    headerActions,
  }: {
    title?: string;
    description?: string;
    children: React.ReactNode;
    className?: string;
    headerActions?: React.ReactNode;
  }) => {
    return (
      <section
        className={cn(
          "space-y-4",
          settings.compactMode && "space-y-3",
          className,
        )}
      >
        {(title || description || headerActions) && (
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <EHeading level={2} className="mb-1">
                  {title}
                </EHeading>
              )}
              {description && <EText variant="muted">{description}</EText>}
            </div>
            {headerActions && <div>{headerActions}</div>}
          </div>
        )}
        {children}
      </section>
    );
  };

  return {
    // Components
    EButton,
    ECard,
    ELoading,
    EGrid,
    EHeading,
    EText,
    ESection,

    // Settings
    settings,
    isReducedMotion,

    // Utilities
    getSpacing: (type: "section" | "card" | "element") => {
      if (settings.compactMode) {
        return type === "section"
          ? "space-y-4"
          : type === "card"
            ? "space-y-3"
            : "space-y-2";
      }
      return type === "section"
        ? "space-y-6"
        : type === "card"
          ? "space-y-4"
          : "space-y-3";
    },

    getTextSize: (level: "heading" | "body" | "caption") => {
      const sizes = {
        heading: {
          large: "text-3xl",
          medium: "text-2xl",
          small: "text-xl",
        },
        body: {
          large: "text-lg",
          medium: "text-base",
          small: "text-sm",
        },
        caption: {
          large: "text-base",
          medium: "text-sm",
          small: "text-xs",
        },
      };
      return sizes[level][settings.fontSize];
    },
  };
}
