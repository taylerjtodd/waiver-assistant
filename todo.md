# Waiver Assistant - Project Plan & TODO

A fantasy football waiver wire assistant and trade analysis web application built with React, Tailwind CSS, and TanStack Table, designed to run entirely in-browser and deployable via GitHub Pages.

---

## Phase 1: Project Setup & Build Infrastructure
- [ ] Initialize React + Vite + TypeScript project in current directory
- [ ] Configure Tailwind CSS and design tokens (modern sports-analytics dark/light theme, rich UI accents)
- [ ] Install dependencies:
  - `@tanstack/react-table` (Table management, sorting, filtering, multi-row selection)
  - `papaparse` (Browser-based CSV parsing)
  - `lucide-react` (Icons)
  - `clsx` + `tailwind-merge` (Styling utilities)
- [ ] Set up Vite base path configuration for GitHub Pages deployment
- [ ] Create GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated build & deployment to GitHub Pages

---

## Phase 2: Sleeper API Integration & State Management
- [ ] Implement Sleeper API client:
  - Fetch league info (`/v1/league/<league_id>`)
  - Fetch league users/members (`/v1/league/<league_id>/users`)
  - Fetch rosters (`/v1/league/<league_id>/rosters`)
  - Fetch/cache Sleeper NFL player database (`/v1/players/nfl` with IndexedDB/localStorage caching to prevent repeated large payloads)
- [ ] LocalStorage management:
  - Store and manage saved Sleeper League IDs with metadata (League Name, Season, Avatar, User's team)
  - Quick league switcher dropdown & recent leagues bar
  - Active league selector and refresh data mechanism

---

## Phase 3: CSV Ingestion & Player Matching Engine
- [ ] Drag-and-drop CSV upload component with file picker fallback
- [ ] Robust CSV parsing & validation for:
  - `RK` / Ranking
  - `PLAYER NAME` / Player
  - `TEAM` / NFL Team
  - `POS` / Position (e.g. `RB`, `RB1`, `WR12`, `FLEX`)
- [ ] Player Matching & Normalization Engine:
  - Normalize names (handling suffixes like Jr., III, II, punctuation, apostrophes, and common nicknames)
  - Match CSV player entries with Sleeper player IDs & roster assignments
  - Determine roster status: `Free Agent (Available)`, `Rostered: <Team Name>`, `Reserve/IR`, `Taxi`
- [ ] Sample CSV template download & sample data loader for quick preview

---

## Phase 4: TanStack Table & Rich Filtering UI
- [ ] Build high-performance Table component using TanStack Table v8:
  - Columns: Rank, Player Name, Position (with positional badge/rank), NFL Team, Sleeper Roster / Availability Status, Action/Select
  - Column sorting (asc/desc) with visual indicators
  - Search bar (instant filter across name and NFL team)
  - Multi-select row selection for trade comparison & drop planning
- [ ] Advanced Filter Bar:
  - Roster status filters: `All`, `Free Agents Only`, `Rostered Only`
  - Multi-select team/roster filter (select Free Agents + Team A + Team B to analyze trades or drop decisions)
  - Position filter tabs/dropdown (`ALL`, `QB`, `RB`, `WR`, `TE`, `K`, `DEF`, `FLEX`)
  - Tier / Rank range sliders or quick presets (e.g. Top 50, Top 100)

---

## Phase 5: Waiver & Trade Assistant Features
- [ ] Drop Candidate Comparison:
  - Filter for "Free Agents + [My Roster]" to instantly see where free agents rank above rostered players
  - Visual delta indicator (e.g., Free Agent ranked #35 vs. Rostered bench player ranked #78)
- [ ] Multi-Player Trade / Roster Analyzer:
  - Side-by-side comparison drawer/panel for selected players
  - Position breakdown and rank comparison
- [ ] Export filtered view (Export to CSV or copy summary to clipboard)

---

## Phase 6: Polish, Verification & Deployment
- [ ] UI/UX Polish:
  - Modern glassmorphism dark theme with team colors, responsive mobile/desktop layout
  - Error boundary, empty states, and loading skeletons
- [ ] End-to-end testing with sample ranking CSVs and real Sleeper league data
- [ ] Verify GitHub Pages build & deployment action config
