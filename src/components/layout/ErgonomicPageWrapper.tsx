import React from "react";
import { useAccessibility } from "@/contexts/AccessibilityContext";
import { AccessibilityNotifications } from "@/components/ui/accessibility-notifications";
import { cn } from "@/lib/utils";

interface ErgonomicPageWrapperProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  hideNotifications?: boolean;
}

export function ErgonomicPageWrapper({
  children,
  title,
  description,
  icon,
  actions,
  className,
  hideNotifications = false,
}: ErgonomicPageWrapperProps) {
  const { settings } = useAccessibility();

  return (
    <div
      className={cn(
        "space-y-6",
        settings.compactMode && "space-y-4",
        className,
      )}
    >
      {/* Accessibility notifications */}
      {!hideNotifications && <AccessibilityNotifications />}

      {/* Page header */}
      {(title || icon || actions) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="p-2 rounded-lg bg-fantasy-primary/10">{icon}</div>
            )}
            {(title || description) && (
              <div>
                {title && (
                  <h1
                    className={cn(
                      "font-bold text-gray-900 dark:text-gray-100",
                      settings.fontSize === "large" && "text-3xl",
                      settings.fontSize === "medium" && "text-2xl",
                      settings.fontSize === "small" && "text-xl",
                    )}
                  >
                    {title}
                  </h1>
                )}
                {description && (
                  <p
                    className={cn(
                      "text-gray-600 dark:text-gray-400",
                      settings.fontSize === "large" && "text-lg",
                      settings.fontSize === "medium" && "text-base",
                      settings.fontSize === "small" && "text-sm",
                    )}
                  >
                    {description}
                  </p>
                )}
              </div>
            )}
          </div>
          {actions && <div className="flex gap-2">{actions}</div>}
        </div>
      )}

      {/* Page content */}
      <div
        className={cn(
          settings.compactMode && "space-y-4",
          !settings.compactMode && "space-y-6",
        )}
      >
        {children}
      </div>
    </div>
  );
}

// Enhanced components for consistent UI
export function ErgonomicCard({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { settings } = useAccessibility();

  return (
    <div
      className={cn(
        "rounded-lg border bg-card text-card-foreground shadow-sm",
        settings.highContrast && "border-2 border-foreground/20",
        settings.compactMode && "p-4",
        !settings.compactMode && "p-6",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function ErgonomicGrid({
  children,
  className,
  columns = "auto-fit",
  minWidth = "300px",
  ...props
}: React.ComponentProps<"div"> & {
  columns?: string;
  minWidth?: string;
}) {
  const { settings } = useAccessibility();

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
}

export function ErgonomicSection({
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
}) {
  const { settings } = useAccessibility();

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
              <h2
                className={cn(
                  "font-semibold text-foreground",
                  settings.fontSize === "large" && "text-xl",
                  settings.fontSize === "medium" && "text-lg",
                  settings.fontSize === "small" && "text-base",
                )}
              >
                {title}
              </h2>
            )}
            {description && (
              <p
                className={cn(
                  "text-muted-foreground",
                  settings.fontSize === "large" && "text-base",
                  settings.fontSize === "medium" && "text-sm",
                  settings.fontSize === "small" && "text-xs",
                )}
              >
                {description}
              </p>
            )}
          </div>
          {headerActions && <div>{headerActions}</div>}
        </div>
      )}
      {children}
    </section>
  );
}
