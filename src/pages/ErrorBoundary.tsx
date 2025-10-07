import React, { Component, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Aggiorna lo stato per far mostrare il fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Puoi loggare l'errore su un servizio esterno qui
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // UI di fallback
      return (
        <div style={{ padding: 20, textAlign: "center" }}>
          <h2>Oops! Qualcosa è andato storto.</h2>
          <details style={{ whiteSpace: "pre-wrap" }}>
            {this.state.error?.message}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}
