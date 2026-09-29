# TodoList

A dark, keyboard-friendly task manager built with React and Vite. Tasks live in the browser, so the app runs without a backend, an account, or a network connection.

Originally built for the HNG 15 Week 1 task.

**Live demo:** _add your deployed URL here_

---

## Table of contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Getting started](#getting-started)
- [Project structure](#project-structure)
- [Data model and storage](#data-model-and-storage)
- [Behaviour reference](#behaviour-reference)
- [Design system](#design-system)
- [Testing](#testing)
- [Accessibility](#accessibility)
- [Deployment](#deployment)
- [Known limitations](#known-limitations)
- [Troubleshooting](#troubleshooting)

---

## Features

| Feature | Notes |
| --- | --- |
| Create tasks | Type a title, optionally pick a due date and priority, press Enter or Add |
| Edit tasks | Click the task title, change it, press Enter. Escape cancels |
| Complete tasks | Click the checkbox to toggle done. Completed tasks are dimmed and struck through |
| Delete tasks | The X button on each row. No confirmation dialog |
| Due dates | Per task. Rows are labelled `Due today`, `Sep 30`, or `Overdue: Sep 28` |
| Priorities | High, Medium, Low. Shown as a colour-coded dot you can click to change |
| Search | Case-insensitive match on the task title |
| Filters | All, Active, Completed, Today, Overdue |
| Sorting | Newest first, Due date, Priority |
| Clear completed | Removes every finished task in one click. Only appears when something is done |
| Persistence | Everything is saved to browser storage and survives a refresh |

There is no sign-in, no server, and no sharing. Each browser keeps its own list.

---

## Tech stack

| Area | Choice |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |
| Testing | Vitest 5 + React Testing Library, running in jsdom |
| Storage | `window.localStorage` |

No state-management library, no router, no component library. For an app this size, React state and a couple of small modules are enough.

---

## Getting started

### Prerequisites

- Node.js 20 or newer (developed against Node 24)
- npm 10 or newer

### Install and run

```bash
npm install
npm run dev
```

Vite prints a local URL, `http://localhost:5173` by default. Open it in a browser.

### Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server with hot module replacement |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the built output locally, for a final check |
| `npm test` | Run the full test suite once |
| `npm run test:watch` | Re-run tests as files change |

---

## Project structure

```
TodoList/
  index.html                  # Vite entry point, loads Inter and mounts the app
  vite.config.js              # Vite + Tailwind plugins, Vitest configuration
  package.json
  DESIGN.md                   # Design source of truth (see Design system)
  src/
    main.jsx                  # React bootstrap
    App.jsx                   # Page shell: state, filtering, layout
    index.css                 # Tailwind import and all design tokens
    components/
      TodoInput.jsx           # Add form: title, due date, priority
      TodoItem.jsx            # One row: checkbox, title, priority dot, due date, delete
      TodoList.jsx            # Renders the list of rows
      FilterBar.jsx           # All / Active / Completed / Today / Overdue
      SearchInput.jsx         # Search field
      SortControl.jsx         # Sort selector
      EmptyState.jsx          # Context-aware empty message
    hooks/
      useTodos.js             # All task state, mutations and persistence
    lib/
      dates.js                # Date helpers, overdue rules, labels
      priority.js             # Priority definitions and ordering
      tasks.js                # Filter, search and sort logic, empty messages
    test/
      setup.js                # jest-dom matchers
```

Two rules keep the codebase predictable:

1. **Business rules live in `src/lib/`.** Filtering, sorting and date logic are plain functions with no React in them, which makes them fast to unit test.
2. **All task state lives in `useTodos`.** Components receive data and callbacks; they never touch `localStorage` themselves.

---

## Data model and storage

Tasks are stored under a single `localStorage` key: **`todos`**, holding a JSON array.

| Field | Type | Description |
| --- | --- | --- |
| `id` | `string` | `crypto.randomUUID()` where available, otherwise a timestamp-based fallback |
| `text` | `string` | Required. Empty or whitespace-only titles are rejected |
| `done` | `boolean` | Completion state |
| `createdAt` | `string` | ISO timestamp. Used for the "newest first" sort |
| `dueDate` | `string \| null` | Local calendar date as `YYYY-MM-DD`, or `null` |
| `priority` | `string \| null` | `"high"`, `"medium"`, `"low"`, or `null` |

**How it behaves**

- The list is read once on mount and written back on every change.
- Dates are stored as plain `YYYY-MM-DD` strings and compared as strings, which sidesteps timezone drift entirely.
- Saved data is normalised on load: unknown priorities become `null`, malformed dates become `null`, and entries without usable text are discarded.
- If the stored JSON is corrupted or unavailable - a private window, a quota error, disabled storage - the app falls back to an empty list and keeps working for the session instead of crashing.

---

## Behaviour reference

### Filters

| Filter | Shows |
| --- | --- |
| All | Everything |
| Active | Tasks that are not done |
| Completed | Tasks that are done |
| Today | Tasks due today **plus** anything overdue |
| Overdue | Tasks past their due date that are **not** done |

Search always combines with the selected filter. If a filter and a search produce nothing, the empty state names the search term.

### Sorting

| Option | Order |
| --- | --- |
| Newest first | Most recently created first (default) |
| Due date | Earliest due date first. Tasks with no due date sink to the bottom |
| Priority | High, then Medium, then Low. Tasks with no priority sink to the bottom |

Every sort falls back to newest-first to break ties, so the order is always stable and reproducible.

### The overdue rule

A task counts as overdue when both of these are true:

1. It has a due date earlier than today.
2. It is not completed.

Completing a late task clears its overdue status immediately. A finished task never nags you again, and the overdue counter in the header reflects that.

---

## Design system

The visual language comes from `DESIGN.md`, an analysis of Linear's marketing site. That file is the source of truth; the code implements it.

- **Dark only.** The design explicitly forbids a light mode, so there is no theme toggle.
- **A near-black canvas.** `#010102` for the page, with a four-step surface ladder (`surface-1` through `surface-4`) creating depth instead of shadows.
- **Hairline borders.** Subtle 1px borders on lifted panels. The brand avoids drop shadows on dark.
- **One accent colour.** Lavender `#5e6ad2`, reserved for the primary button, focus rings and completed checkboxes. It is never used decoratively.
- **Inter** as the typeface, at a 4px spacing rhythm, with 8px corners for controls and 12px for panels.
- **Priority dots are the one exception.** The design notes that Linear's product UI uses a small colour-tag palette, so High, Medium and Low use red, amber and blue dots respectively.

All tokens are declared once in `src/index.css` under Tailwind v4's `@theme` block, so components use semantic classes such as `bg-surface-1` and `text-ink-subtle` rather than raw hex values. To retheme the app, change that block.

---

## Testing

```bash
npm test
```

38 tests across two files, all passing.

| File | Tests | Scope |
| --- | --- | --- |
| `src/lib/tasks.test.js` | 13 | Filtering, searching and sorting as pure functions |
| `src/App.test.jsx` | 25 | The app through the UI, driven by real user events |

The integration suite covers adding, editing, cancelling an edit, rejecting blank input, toggling, deleting, every filter, search on its own and combined with a filter, all three sort orders, due-date and priority handling, the overdue rule, clearing completed tasks, persistence across a reload, and recovery from corrupted saved data.

Tests interact with the UI the way a person would - by label, role and visible text - rather than reaching into component internals, so refactoring the markup does not break them unnecessarily.

---

## Accessibility

- Every control is a real, focusable element. No clickable `div`s.
- The checkbox is a button with `role="checkbox"` and a live `aria-checked` state.
- Accessible names carry context, for example `Delete "Buy milk"` and `Priority for "Buy milk"`, so screen-reader users hear which task each control belongs to.
- Focus is always visible as a 2px lavender outline.
- Interactive controls are at least 36px tall, and the primary inputs and buttons reach 44px, which suits touch screens.
- Editing supports the keyboard: Enter commits, Escape cancels.

---

## Deployment

The build output is a static site, so any static host works.

**Netlify**

| Setting | Value |
| --- | --- |
| Base directory | _leave empty_ (the project is at the repository root) |
| Build command | `npm run build` |
| Publish directory | `dist` |

Either connect the Git repository for automatic deploys, or run `npm run build` and drag the `dist` folder onto Netlify Drop for an instant URL.

**Vercel or Cloudflare Pages** use the same build command and output directory.

`dist/` is git-ignored, so hosts always build from source.

---

## Known limitations

These are deliberate scope decisions, not bugs:

- **One device.** The list lives in one browser profile. It does not sync, and it is not shared with anyone who opens your link.
- **No accounts.** There is no sign-in and no server.
- **Dark mode only.** See [Design system](#design-system).
- **No reminders or notifications.**
- **No subtasks, recurring tasks, or multiple lists.**
- **No undo.** Deletes and "clear completed" are immediate and permanent.

---

## Troubleshooting

**`npm.ps1 cannot be loaded because running scripts is disabled` on Windows**

PowerShell's execution policy is blocking the npm shim. Use the `.cmd` variant instead:

```powershell
npm.cmd install
npm.cmd test
npm.cmd run dev
```

**Vite warns that the config is ESM inside CommonJS**

`package.json` is missing `"type": "module"`. Add it back; `vite.config.js` uses ES module syntax.

**Everything disappeared after refreshing**

Safari private browsing and some hardened browser profiles block `localStorage`. The app detects this and keeps working in memory, but nothing can be saved. Try a normal window.
