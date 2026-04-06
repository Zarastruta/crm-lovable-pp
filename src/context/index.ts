// Barrel file — re-exports AppProvider (component) and useApp (hook) from their respective source files.
// This allows consumers to import from "@/context/AppContext" as before,
// while keeping AppContext.tsx a pure component file (Fast Refresh compliant).
export { AppProvider } from "./AppContext";
export { useApp } from "./AppContextTypes";
export type { AppContextType } from "./AppContextTypes";
