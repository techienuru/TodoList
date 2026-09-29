import { isDueToday, isOverdue, todayISO } from './dates.js'
import { priorityRank } from './priority.js'

export const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'today', label: 'Today' },
  { value: 'overdue', label: 'Overdue' },
]

export const SORTS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'dueDate', label: 'Due date' },
  { value: 'priority', label: 'Priority' },
]

const UNRANKED = 3

export function matchesFilter(todo, filter, today = todayISO()) {
  switch (filter) {
    case 'active':
      return !todo.done
    case 'completed':
      return todo.done
    case 'today':
      return isDueToday(todo, today) || isOverdue(todo, today)
    case 'overdue':
      return isOverdue(todo, today)
    default:
      return true
  }
}

export function matchesSearch(todo, query) {
  const needle = query.trim().toLowerCase()
  if (!needle) return true
  return todo.text.toLowerCase().includes(needle)
}

export function sortTodos(todos, sortBy) {
  const byNewest = (a, b) => b.createdAt.localeCompare(a.createdAt)
  const sorted = [...todos]

  if (sortBy === 'dueDate') {
    return sorted.sort((a, b) => {
      if (!a.dueDate && !b.dueDate) return byNewest(a, b)
      if (!a.dueDate) return 1
      if (!b.dueDate) return -1
      return a.dueDate.localeCompare(b.dueDate) || byNewest(a, b)
    })
  }

  if (sortBy === 'priority') {
    return sorted.sort((a, b) => {
      const rankA = a.priority ? priorityRank(a.priority) : UNRANKED
      const rankB = b.priority ? priorityRank(b.priority) : UNRANKED
      return rankA - rankB || byNewest(a, b)
    })
  }

  return sorted.sort(byNewest)
}

export function selectTodos(todos, { filter = 'all', query = '', sortBy = 'newest', today } = {}) {
  const visible = todos.filter(
    (todo) => matchesFilter(todo, filter, today) && matchesSearch(todo, query),
  )
  return sortTodos(visible, sortBy)
}

export function emptyMessage(filter, query) {
  const needle = query.trim()
  if (needle) return `No tasks match "${needle}".`

  switch (filter) {
    case 'active':
      return 'No active tasks. Everything is done.'
    case 'completed':
      return 'No completed tasks yet.'
    case 'today':
      return 'Nothing due today.'
    case 'overdue':
      return 'Nothing overdue.'
    default:
      return 'No tasks yet. Add one above to get started.'
  }
}
