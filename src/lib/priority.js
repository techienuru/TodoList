export const PRIORITIES = [
  { value: 'high', label: 'High', rank: 0, dot: 'bg-priority-high' },
  { value: 'medium', label: 'Medium', rank: 1, dot: 'bg-priority-medium' },
  { value: 'low', label: 'Low', rank: 2, dot: 'bg-priority-low' },
]

const UNRANKED = 3

export function findPriority(value) {
  return PRIORITIES.find((priority) => priority.value === value)
}

export function priorityRank(value) {
  const match = findPriority(value)
  return match ? match.rank : UNRANKED
}

export function priorityDotClass(value) {
  const match = findPriority(value)
  return match ? match.dot : 'bg-ink-tertiary'
}

export function priorityLabel(value) {
  const match = findPriority(value)
  return match ? match.label : 'No priority'
}
