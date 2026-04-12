import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DiscoveredSkillCard } from "../components/discover/DiscoveredSkillCard";
import { DiscoveredSkill } from "../types";

// Mock PlatformIcon
vi.mock("../components/platform/PlatformIcon", () => ({
  PlatformIcon: ({ agentId }: { agentId: string }) => (
    <span data-testid="platform-icon">{agentId}</span>
  ),
}));

// Mock i18next
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        "discover.installToCentral": "Install to Central",
        "discover.installToPlatform": "Install to Platform",
        "discover.alreadyCentral": "Already in Central",
        "discover.selectSkill": "Select skill",
      };
      return map[key] ?? key;
    },
  }),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockSkill: DiscoveredSkill = {
  id: "claude-code__my-app__deploy",
  name: "deploy",
  description: "Deploy the application to production",
  file_path: "/home/user/projects/my-app/.claude/skills/deploy/SKILL.md",
  dir_path: "/home/user/projects/my-app/.claude/skills/deploy",
  platform_id: "claude-code",
  platform_name: "Claude Code",
  project_path: "/home/user/projects/my-app",
  project_name: "my-app",
  is_already_central: false,
};

const mockAlreadyCentralSkill: DiscoveredSkill = {
  ...mockSkill,
  id: "cursor__my-app__review",
  name: "review",
  description: "Review code changes",
  platform_id: "cursor",
  platform_name: "Cursor",
  is_already_central: true,
};

const defaultHandlers = {
  onToggleSelect: vi.fn(),
  onInstallToCentral: vi.fn(),
  onInstallToPlatform: vi.fn(),
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("DiscoveredSkillCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the skill name", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("deploy")).toBeInTheDocument();
  });

  it("renders the skill description", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("Deploy the application to production")).toBeInTheDocument();
  });

  it("renders platform name and icon", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("Claude Code")).toBeInTheDocument();
    expect(screen.getByTestId("platform-icon")).toBeInTheDocument();
  });

  it("renders project name", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("my-app")).toBeInTheDocument();
  });

  it("shows 'Already in Central' badge when is_already_central is true", () => {
    render(
      <DiscoveredSkillCard
        skill={mockAlreadyCentralSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("Already in Central")).toBeInTheDocument();
  });

  it("does not show 'Install to Central' button when skill is already in central", () => {
    render(
      <DiscoveredSkillCard
        skill={mockAlreadyCentralSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.queryByText("Install to Central")).not.toBeInTheDocument();
  });

  it("shows 'Install to Central' button when skill is not in central", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("Install to Central")).toBeInTheDocument();
  });

  it("always shows 'Install to Platform' button", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    expect(screen.getByText("Install to Platform")).toBeInTheDocument();
  });

  it("calls onToggleSelect when checkbox is clicked", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    const checkbox = screen.getByRole("checkbox");
    fireEvent.click(checkbox);
    expect(defaultHandlers.onToggleSelect).toHaveBeenCalled();
  });

  it("calls onInstallToCentral when install-to-central button is clicked", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    const btn = screen.getByText("Install to Central");
    fireEvent.click(btn);
    expect(defaultHandlers.onInstallToCentral).toHaveBeenCalled();
  });

  it("calls onInstallToPlatform when install-to-platform button is clicked", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    const btn = screen.getByText("Install to Platform");
    fireEvent.click(btn);
    expect(defaultHandlers.onInstallToPlatform).toHaveBeenCalled();
  });

  it("shows disabled buttons when importing", () => {
    render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={false}
        isImporting={true}
        {...defaultHandlers}
      />
    );
    const centralBtn = screen.getByText("Install to Central").closest("button");
    const platformBtn = screen.getByText("Install to Platform").closest("button");
    expect(centralBtn).toBeDisabled();
    expect(platformBtn).toBeDisabled();
  });

  it("shows selected state with ring when isSelected is true", () => {
    const { container } = render(
      <DiscoveredSkillCard
        skill={mockSkill}
        isSelected={true}
        isImporting={false}
        {...defaultHandlers}
      />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.className).toContain("ring-1");
  });
});
