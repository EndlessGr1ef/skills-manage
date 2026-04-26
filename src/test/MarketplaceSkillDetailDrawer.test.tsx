import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MarketplaceSkillDetailDrawer } from "@/components/marketplace/MarketplaceSkillDetailDrawer";

vi.mock("@/components/skill/SkillDetailDrawer", () => ({
  SkillDetailDrawer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("react-markdown", () => ({
  default: ({
    children,
    remarkPlugins,
  }: {
    children: string;
    remarkPlugins?: unknown[];
  }) => (
    <div
      data-testid="react-markdown"
      data-has-remark-gfm={remarkPlugins && remarkPlugins.length > 0 ? "true" : "false"}
    >
      {children}
    </div>
  ),
}));

const skill = {
  id: "skill-1",
  name: "baoyu-imagine",
  downloadUrl: "https://example.com/skills/baoyu-imagine/SKILL.md",
  description: "AI image generation skill",
  sourceLabel: "Repo One",
  sourceUrl: "https://github.com/acme/repo-one",
  installed: false,
};

const skillWithFiles = {
  ...skill,
  id: "skill-2",
  name: "file-tree-skill",
  files: [
    { name: "scripts", path: "skills/file-tree-skill/scripts", is_dir: true },
    { name: "helper.ts", path: "skills/file-tree-skill/scripts/helper.ts", is_dir: false },
  ],
};

const mockContent = `---
name: baoyu-imagine
version: 1.57.0
metadata:
  openclaw:
    requires:
      anyBins:
        - bun
        - npx
---

# Image Generation

Body content.`;

describe("MarketplaceSkillDetailDrawer", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => mockContent,
      })
    );
  });

  it("renders frontmatter card in markdown preview", async () => {
    render(
      <MarketplaceSkillDetailDrawer
        open
        skill={skill}
        onOpenChange={vi.fn()}
        onInstall={vi.fn()}
        isInstalling={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: /Frontmatter/i })).toBeInTheDocument();
    });

    const frontmatter = screen.getByRole("heading", { name: /Frontmatter/i }).closest("section");
    expect(frontmatter).not.toBeNull();
    expect(within(frontmatter as HTMLElement).getByText("baoyu-imagine")).toBeInTheDocument();
    expect(within(frontmatter as HTMLElement).getByText(/v1\.57\.0/i)).toBeInTheDocument();
    expect(within(frontmatter as HTMLElement).getByText("bun")).toBeInTheDocument();
    expect(within(frontmatter as HTMLElement).getByText("npx")).toBeInTheDocument();
    expect(screen.getByTestId("react-markdown")).toHaveTextContent("# Image Generation");
  });

  it("keeps raw source tab showing original frontmatter fences", async () => {
    render(
      <MarketplaceSkillDetailDrawer
        open
        skill={skill}
        onOpenChange={vi.fn()}
        onInstall={vi.fn()}
        isInstalling={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId("react-markdown")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: /原始源码/i }));

    await waitFor(() => {
      expect(screen.getByText(/name: baoyu-imagine/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/---/)).toBeInTheDocument();
  });

  it("renders marketplace file entries as non-interactive when no file selection handler exists", async () => {
    render(
      <MarketplaceSkillDetailDrawer
        open
        skill={skillWithFiles}
        onOpenChange={vi.fn()}
        onInstall={vi.fn()}
        isInstalling={false}
      />
    );

    await waitFor(() => {
      expect(screen.getByText(/Files \(2\)/i)).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole("button", { name: "scripts" }));

    await waitFor(() => {
      expect(screen.getByText("helper.ts")).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "helper.ts" })).not.toBeInTheDocument();
  });
});
