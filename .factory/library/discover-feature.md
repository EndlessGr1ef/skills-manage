# Discover Feature

## Backend Commands (src-tauri/src/commands/discover.rs)

| Command | Parameters | Returns | Notes |
|---------|-----------|---------|-------|
| `discover_scan_roots` | none | `Vec<ScanRoot>` | Auto-detects roots, no persistence |
| `get_scan_roots` | none | `Vec<ScanRoot>` | Returns roots with persisted enabled state from DB |
| `set_scan_root_enabled` | `path: String, enabled: bool` | `()` | Persists to `discover_scan_roots_config` setting in DB |
| `start_project_scan` | `roots: Vec<ScanRoot>` | `DiscoverResult` | Emits `discover:progress`, `discover:found`, `discover:complete` events |
| `stop_project_scan` | none | `()` | Sets AtomicBool cancel flag |
| `get_discovered_skills` | none | `Vec<DiscoveredProject>` | Loads cached results from DB |
| `import_discovered_skill_to_central` | `discoveredSkillId: String` | `ImportResult` | Copies skill dir to `~/.agents/skills/` |
| `import_discovered_skill_to_platform` | `discoveredSkillId: String, agentId: String` | `ImportResult` | Creates symlink in platform dir |
| `clear_discovered_skills` | none | `()` | Clears all from DB |

**Important**: Use `get_scan_roots` (not `discover_scan_roots`) for the config dialog to get persisted enabled/disabled states. Tauri v2 command args use camelCase (e.g., `discoveredSkillId` not `discovered_skill_id`).

## Frontend Components

- `DiscoverView.tsx` — Main page with search, group-by toggle, batch selection
- `DiscoverConfigDialog.tsx` — Scan config dialog with root checkboxes
- `DiscoveredSkillCard.tsx` — Skill card with checkbox, install buttons, platform badge

## Frontend Store (discoverStore.ts)

- Uses `@tauri-apps/api/event` `listen()` for streaming scan progress
- `loadScanRoots` calls `get_scan_roots` (persisted version)
- `setScanRootEnabled` does optimistic local update + backend persist
- `selectedSkillIds` is a `Set<string>` for batch operations
- Auto-loads cached results on mount via `loadDiscoveredSkills()`

## Sidebar Integration

- Discover entry added between Central Skills and Collections sections
- Uses `FolderSearch` lucide icon
- Badge shows `totalSkillsFound` count from discoverStore
- discoverStore's `loadDiscoveredSkills` called in Sidebar's useEffect on mount

## i18n Keys

All discover strings are under `discover.*` namespace in `zh.json` and `en.json`.
