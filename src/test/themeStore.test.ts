import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useThemeStore, CatppuccinFlavor } from "../stores/themeStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Reset the store to default state and clear localStorage. */
function resetStore() {
  useThemeStore.setState({ flavor: "mocha" });
  try {
    localStorage.removeItem("catppuccin-flavor");
  } catch {
    // ignore
  }
  // Remove data-theme from document if present
  if (typeof document !== "undefined") {
    delete document.documentElement.dataset.theme;
  }
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("themeStore", () => {
  beforeEach(() => {
    resetStore();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetStore();
  });

  // ── Initial State ─────────────────────────────────────────────────────────

  it("has mocha as the default flavor before init", () => {
    const state = useThemeStore.getState();
    expect(state.flavor).toBe("mocha");
  });

  // ── setFlavor ─────────────────────────────────────────────────────────────

  it("setFlavor updates the store flavor", () => {
    useThemeStore.getState().setFlavor("latte");
    expect(useThemeStore.getState().flavor).toBe("latte");
  });

  it("setFlavor sets data-theme on document.documentElement", () => {
    useThemeStore.getState().setFlavor("frappe");
    expect(document.documentElement.dataset.theme).toBe("frappe");
  });

  it("setFlavor persists flavor to localStorage", () => {
    useThemeStore.getState().setFlavor("macchiato");
    expect(localStorage.getItem("catppuccin-flavor")).toBe("macchiato");
  });

  it("setFlavor works for all four flavors", () => {
    const flavors: CatppuccinFlavor[] = ["mocha", "macchiato", "frappe", "latte"];
    for (const flavor of flavors) {
      useThemeStore.getState().setFlavor(flavor);
      expect(useThemeStore.getState().flavor).toBe(flavor);
      expect(document.documentElement.dataset.theme).toBe(flavor);
      expect(localStorage.getItem("catppuccin-flavor")).toBe(flavor);
    }
  });

  // ── init ──────────────────────────────────────────────────────────────────

  it("init applies stored flavor from localStorage", () => {
    localStorage.setItem("catppuccin-flavor", "macchiato");
    useThemeStore.getState().init();
    expect(useThemeStore.getState().flavor).toBe("macchiato");
    expect(document.documentElement.dataset.theme).toBe("macchiato");
  });

  it("init falls back to system preference when no stored flavor", () => {
    // No localStorage value set — should use system preference
    const spy = vi.spyOn(window, "matchMedia");
    spy.mockReturnValue({ matches: true } as MediaQueryList);
    useThemeStore.getState().init();
    // light preference → latte
    expect(useThemeStore.getState().flavor).toBe("latte");

    spy.mockRestore();
  });

  it("init defaults to mocha for dark system preference", () => {
    const spy = vi.spyOn(window, "matchMedia");
    spy.mockReturnValue({ matches: false } as MediaQueryList);
    useThemeStore.getState().init();
    // dark preference → mocha
    expect(useThemeStore.getState().flavor).toBe("mocha");

    spy.mockRestore();
  });

  it("init writes flavor to localStorage", () => {
    // Mock matchMedia for jsdom
    const spy = vi.spyOn(window, "matchMedia");
    spy.mockReturnValue({ matches: false } as MediaQueryList);

    useThemeStore.getState().init();
    const stored = localStorage.getItem("catppuccin-flavor");
    expect(stored).toBeTruthy();
    expect(["mocha", "macchiato", "frappe", "latte"]).toContain(stored);

    spy.mockRestore();
  });

  it("init sets data-theme on document.documentElement", () => {
    localStorage.setItem("catppuccin-flavor", "frappe");
    useThemeStore.getState().init();
    expect(document.documentElement.dataset.theme).toBe("frappe");
  });

  it("stored flavor takes priority over system preference", () => {
    // System prefers light (→ latte), but stored is macchiato
    localStorage.setItem("catppuccin-flavor", "macchiato");
    const spy = vi.spyOn(window, "matchMedia");
    spy.mockReturnValue({ matches: true } as MediaQueryList);

    useThemeStore.getState().init();
    expect(useThemeStore.getState().flavor).toBe("macchiato");

    spy.mockRestore();
  });

  it("invalid localStorage value is ignored, falls back to system preference", () => {
    localStorage.setItem("catppuccin-flavor", "invalid-flavor");
    const spy = vi.spyOn(window, "matchMedia");
    spy.mockReturnValue({ matches: false } as MediaQueryList);

    useThemeStore.getState().init();
    // Falls back to system: dark → mocha
    expect(useThemeStore.getState().flavor).toBe("mocha");

    spy.mockRestore();
  });
});
