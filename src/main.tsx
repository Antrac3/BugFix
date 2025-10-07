import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Fix FullStory namespace conflicts
if (typeof window !== "undefined") {
  (window as any)["_fs_namespace"] = "FS";
  // Suppress FullStory errors if not needed
  if (!(window as any).FS) {
    (window as any).FS = {
      event: () => {},
      log: () => {},
      getCurrentSessionURL: () => null,
      identify: () => {},
    };
  }
}

createRoot(document.getElementById("root")!).render(<App />);
