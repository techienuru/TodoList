export function SearchInput({ value, onChange }) {
  return (
    <input
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search tasks"
      aria-label="Search tasks"
      className="min-h-11 w-full rounded-md border border-hairline bg-surface-2 px-3 text-base text-ink placeholder:text-ink-tertiary focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-focus/50"
    />
  )
}
