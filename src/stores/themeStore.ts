import { create } from "zustand";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CatppuccinFlavor = "mocha" | "macchiato" | "frappe" | "latte";

const STORAGE_KEY = "catppuccin-flavor";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Detect system color-scheme preference. Returns "latte" for light, "mocha" for dark. */
function systemFlavor(): CatppuccinFlavor {
  if (typeof window === "undefined") return "mocha";
  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "latte"
    : "mocha";
}

/** Read persisted flavor from localStorage (returns null if not set). */
function readStoredFlavor(): CatppuccinFlavor | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored === "mocha" ||
      stored === "macchiato" ||
      stored === "frappe" ||
      stored === "latte"
    ) {
      return stored;
    }
  } catch {
    // localStorage unavailable (SSR, privacy mode, etc.)
  }
  return null;
}

/** Apply flavor to the DOM — sets data-theme on <html> and persists to localStorage. */
function applyFlavor(flavor: CatppuccinFlavor): void {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.theme = flavor;
  }
  try {
    localStorage.setItem(STORAGE_KEY, flavor);
  } catch {
    // Silently ignore storage errors
  }
}

// ─── State ────────────────────────────────────────────────────────────────────

interface ThemeState {
  flavor: CatppuccinFlavor;

  // Actions
  setFlavor: (flavor: CatppuccinFlavor) => void;
  /** Initialize theme — call once before React renders to prevent flash. */
  init: () => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useThemeStore = create<ThemeState>((set) => ({
  flavor: "mocha", // safe default; init() overrides

  setFlavor: (flavor) => {
    applyFlavor(flavor);
    set({ flavor });
  },

  init: () => {
    const flavor = readStoredFlavor() ?? systemFlavor();
    applyFlavor(flavor);
    set({ flavor });
  },
}));
