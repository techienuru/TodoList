import { SORTS } from '../lib/tasks.js'

export function SortControl({ value, onChange }) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      aria-label="Sort tasks"
      className="min-h-9 rounded-md border border-hairline bg-surface-2 px-2 text-sm text-ink focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-focus/50"
    >
      {SORTS.map((sort) => (
        <option key={sort.value} value={sort.value}>
          {sort.label}
        </option>
      ))}
    </select>
  )
}
