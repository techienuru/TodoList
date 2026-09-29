const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
]

export function FilterBar({ value, onChange }) {
  return (
    <div role="group" aria-label="Filter tasks" className="flex w-fit gap-1 rounded-pill bg-canvas p-1">
      {FILTERS.map((filter) => {
        const isSelected = filter.value === value
        return (
          <button
            key={filter.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onChange(filter.value)}
            className={`min-h-9 rounded-pill px-3.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50 ${
              isSelected ? 'bg-surface-2 text-ink' : 'text-ink-subtle hover:text-ink-muted'
            }`}
          >
            {filter.label}
          </button>
        )
      })}
    </div>
  )
}
