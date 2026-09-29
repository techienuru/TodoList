const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export function todayISO(date = new Date()) {
  const offsetMs = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 10)
}

export function formatDueDate(iso) {
  if (!iso) return ''
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return ''
  return `${MONTHS[month - 1]} ${day}`
}

export function isOverdue(todo, today = todayISO()) {
  return Boolean(todo.dueDate) && !todo.done && todo.dueDate < today
}

export function isDueToday(todo, today = todayISO()) {
  return Boolean(todo.dueDate) && todo.dueDate === today
}

export function dueDateLabel(todo, today = todayISO()) {
  if (!todo.dueDate) return 'Set due date'
  if (isOverdue(todo, today)) return `Overdue: ${formatDueDate(todo.dueDate)}`
  if (todo.dueDate === today) return 'Due today'
  return formatDueDate(todo.dueDate)
}
