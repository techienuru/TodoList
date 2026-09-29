# AGENTS.md

Guidance for AI coding agents working in this repository. Read this before changing anything.

---

## Project summary

A client-side task manager. React 19, Vite 8, Tailwind CSS v4, Vitest 5 with React Testing Library. No backend, no authentication, no network calls at runtime. Tasks persist in `window.localStorage` under the key `todos`.

The app is small and deliberately dependency-light. Resist adding libraries for problems that a few lines of plain JavaScript would solve.

---

## Commands

| Command | Purpose |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run dev` | Development server with HMR |
| `npm run build` | Production build into `dist/` |
| `npm test` | Run the full suite once (38 tests, all should pass) |
| `npm run test:watch` | Watch mode |

Run `npm test` before claiming any task is complete. A change that leaves the suite red is not finished.

**Windows note:** if `npm` fails with `npm.ps1 cannot be loaded because running scripts is disabled`, call `npm.cmd` instead. This is a local execution-policy setting, not a project problem.

---

## Architecture

```
src/
  App.jsx           page shell: owns filter, search and sort UI state
  hooks/useTodos.js owns the task array and every mutation + persistence
  lib/              pure business logic, no React
  components/       presentational; receive props, call callbacks
```

Two boundaries matter and should be preserved:

1. **`src/lib/` holds the rules.** Filtering, searching, sorting and date arithmetic are pure functions. They are the only place these rules should live. If you find yourself writing a date comparison or a sort comparator inside a component, move it here instead.
2. **`useTodos` owns state.** No component reads or writes `localStorage` directly. Components take data plus callbacks and stay unaware of persistence.

`src/lib/tasks.js` is the single entry point for "given the tasks and the current view settings, what should be on screen?" - that is `selectTodos(todos, { filter, query, sortBy })`. Extend it rather than filtering inside `App.jsx`.

---

## Domain rules

These behaviours are intentional and covered by tests. Do not regress them without being asked.

- **Storage key is `todos`.** A JSON array. Changing the shape requires updating `normalizeTodo` in `useTodos.js` so existing saved data still loads.
- **Dates are `YYYY-MM-DD` strings**, compared as strings. Never convert them to `Date` objects for comparison - that reintroduces timezone drift.
- **A task is overdue when it has a due date before today AND is not completed.** Completing a late task clears its overdue state immediately.
- **The Today filter means due today plus overdue**, not "due today only".
- **Blank titles are rejected.** Adding or renaming to whitespace is a no-op, and the existing text is preserved.
- **Sorting always falls back to newest-first** to break ties, so ordering is stable and reproducible.
- **Sorting by due date or priority pushes unranked tasks to the bottom**, not the top.
- **New tasks go to the front** of the array.
- **Saved data is normalised on load.** Unknown priorities become `null`, malformed dates become `null`, entries without usable text are dropped.
- **Storage failures are swallowed.** Private-browsing or quota errors must never crash the app; it falls back to in-memory state.

---

## Design system

`DESIGN.md` at the repository root is the design source of truth - an analysis of Linear's marketing site. The implementation lives in the `@theme` block of `src/index.css`.

Rules that are easy to violate by accident:

- **Dark only.** A light mode is explicitly forbidden by the design. Do not add a theme toggle or light-mode classes.
- **Never hard-code hex colours in components.** Use the semantic tokens: `bg-canvas`, `bg-surface-1` through `bg-surface-4`, `border-hairline`, `text-ink`, `text-ink-muted`, `text-ink-subtle`, `text-ink-tertiary`, `bg-primary`, `bg-primary-hover`, `outline-primary-focus`.
- **Lavender is scarce.** Use `primary` only for the main call to action, focus rings and the completed checkbox. Never as a decorative fill or a second accent.
- **No drop shadows on dark surfaces.** Depth comes from the surface ladder plus hairline borders. The one exception is the subtle inner top highlight already on the main panel.
- **No second brand accent.** The only sanctioned colour outside the accent is the priority dot palette (red / amber / blue), which the design permits because Linear's product UI uses colour tags.
- **Radii:** 4px checkboxes and chips, 8px controls, 12px panels, pill-shaped toggles.
- **Spacing follows a 4px rhythm.** Prefer the spacing scale over arbitrary values.
- **Typeface is Inter** with a system fallback stack.

If a requested feature seems to conflict with `DESIGN.md`, say so and propose an on-brand alternative rather than silently breaking the system.

---

## Code conventions

- Plain JavaScript with JSX. No TypeScript in this project.
- One component per file, named exports, file name matching the component name.
- Import paths include the extension, for example `./components/TodoItem.jsx` and `../lib/tasks.js`.
- Keep components presentational. Derive nothing from storage inside them.
- Use Tailwind utility classes in `className`; there are no CSS module or styled-component files.
- Prefer small pure helpers in `src/lib/` over inline logic in components.
- Do not add comments that restate the code. A comment is warranted only for a non-obvious constraint, such as why a storage call is wrapped in a try/catch.
- Match the existing formatting: two-space indentation, single quotes, no semicolons.

---

## Testing

- `src/lib/tasks.test.js` covers the pure helpers.
- `src/App.test.jsx` drives the real UI with `@testing-library/user-event`.
- Query by role, label or visible text - never by CSS class or component internals.
- Accessible names are load-bearing. Row controls are named after their task, for example `Delete "Buy milk"` and `Priority for "Buy milk"`. Keep that pattern when adding controls, and keep names unique so tests stay unambiguous.
- Prefer `fireEvent.change` for `<input type="date">`; typing into date inputs is unreliable in jsdom.
- Add or update tests with any behaviour change. New user-facing features without tests will be considered incomplete.
- Avoid asserting on exact styling. Assert on behaviour and accessible state (`aria-checked`, `aria-pressed`, values).

---

## Environment gotchas

- `package.json` must keep `"type": "module"`. Without it, `vite.config.js` triggers an ESM-in-CommonJS warning on every run.
- On Windows, prefer `npm.cmd` over `npm` in PowerShell.
- `dist/` and `node_modules/` are git-ignored. Never commit build output.
- The app requests Inter from Google Fonts in `index.html`. If it fails to load, the system fallback stack takes over; the app must stay usable either way.

---

## Working agreements

- Do not commit, branch, or tag unless explicitly asked.
- Do not add dependencies without explaining why an existing tool will not do.
- Keep changes scoped to the request. Do not refactor adjacent code or "fix" unrelated issues in the same change.
- If a requirement is ambiguous, ask before building. Do not guess at behaviour that affects stored data.
- Update `README.md` when user-facing behaviour, scripts, or setup steps change.
