# Waiver Assistant - Project Plan & TODO

A fantasy football waiver wire assistant and trade analysis web application built with React, Tailwind CSS, and TanStack Table, designed to run entirely in-browser and deployable via GitHub Pages.

---

## Phase 1: Project Setup & Build Infrastructure
- [x] Initialize React + Vite + TypeScript project in current directory
- [x] Configure Tailwind CSS and design tokens (modern sports-analytics dark/light theme, rich UI accents)
- [x] Install dependencies:
  - `@tanstack/react-table` (Table management, sorting, filtering, multi-row selection)
  - `papaparse` (Browser-based CSV parsing)
  - `lucide-react` (Icons)
  - `clsx` + `tailwind-merge` (Styling utilities)
- [x] Set up Vite base path configuration for GitHub Pages deployment
- [x] Create GitHub Actions workflow (`.github/workflows/deploy.yml`) for automated build & deployment to GitHub Pages

---

## Phase 2: Sleeper API Integration & State Management
- [x] Implement Sleeper API client:
  - Fetch league info (`/v1/league/<league_id>`)
  - Fetch league users/members (`/v1/league/<league_id>/users`)
  - Fetch rosters (`/v1/league/<league_id>/rosters`)
  - Fetch/cache Sleeper NFL player database (`/v1/players/nfl` with IndexedDB/localStorage caching to prevent repeated large payloads)
- [x] LocalStorage management:
  - Store and manage saved Sleeper League IDs with metadata (League Name, Season, Avatar, User's team)
  - Quick league switcher dropdown & recent leagues bar
  - Active league selector and refresh data mechanism

---

## Phase 3: CSV Ingestion & Player Matching Engine
- [x] Drag-and-drop CSV upload component with file picker fallback
- [x] Robust CSV parsing & validation for:
  - `RK` / Ranking
  - `PLAYER NAME` / Player
  - `TEAM` / NFL Team
  - `POS` / Position (e.g. `RB`, `RB1`, `WR12`, `FLEX`)
- [x] Player Matching & Normalization Engine:
  - Normalize names (handling suffixes like Jr., III, II, punctuation, apostrophes, and common nicknames)
  - Match CSV player entries with Sleeper player IDs & roster assignments
  - Determine roster status: `Free Agent (Available)`, `Rostered: <Team Name>`, `Reserve/IR`, `Taxi`
- [x] Sample CSV template download & sample data loader for quick preview

---

## Phase 4: TanStack Table & Rich Filtering UI
- [x] Build high-performance Table component using TanStack Table v8:
  - Columns: Rank, Player Name, Position (with positional badge/rank), NFL Team, Sleeper Roster / Availability Status, Action/Select
  - Column sorting (asc/desc) with visual indicators
  - Search bar (instant filter across name and NFL team)
  - Multi-select row selection for trade comparison & drop planning
- [x] Advanced Filter Bar:
  - Roster status filters: `All`, `Free Agents Only`, `Rostered Only`
  - Multi-select team/roster filter (select Free Agents + Team A + Team B to analyze trades or drop decisions)
  - Position filter tabs/dropdown (`ALL`, `QB`, `RB`, `WR`, `TE`, `K`, `DEF`, `FLEX`)
  - Tier / Rank range sliders or quick presets (e.g. Top 50, Top 100)

---

## Phase 5: Waiver & Trade Assistant Features
- [ ] Selection Bar & Validation:
  - On row selection, show a selected count indicator and a "Compare / Preview" button
  - Validation rules: only enable preview when selections are limited to My Team, one other team, and/or Free Agents (disable or alert if players from multiple opposing teams are selected)
  - Quick action to clear selected players
- [ ] Transaction Preview View (Drawer / Modal):
  - **Trade Transaction Preview** (when selections include players from My Team and another team):
    - Preview transaction assuming players from My Team are traded to the other manager and vice versa
    - Show side-by-side manager columns with rank, position, and net value/rank deltas
    - Include a third column displaying any selected Free Agents (e.g. for accompanying waiver adds)
  - **Waiver Transaction Preview** (when selections only include players from My Team and Free Agents):
    - Preview waiver transaction assuming selected players from My Team are dropped to make room to add selected Free Agents
    - Side-by-side comparison of Drop Candidates vs. Waiver Targets with rank delta indicators (visual upgrade/downgrade)

---

## Phase 6: Polish, Verification & Deployment
- [ ] UI/UX Polish:
  - Modern glassmorphism dark theme with team colors, responsive mobile/desktop layout
  - Error boundary, empty states, and loading skeletons
- [ ] End-to-end testing with sample ranking CSVs and real Sleeper league data
- [ ] Verify GitHub Pages build & deployment action config
