import { describe, expect, it } from 'vitest'
import { emptyMessage, matchesFilter, matchesSearch, selectTodos, sortTodos } from './tasks.js'

const TODAY = '2026-09-29'
const YESTERDAY = '2026-09-28'
const TOMORROW = '2026-09-30'

function makeTodo(overrides = {}) {
  return {
    id: overrides.text ?? 'id',
    text: 'Task',
    done: false,
    createdAt: '2026-09-01T10:00:00.000Z',
    dueDate: null,
    priority: null,
    ...overrides,
  }
}

describe('matchesFilter', () => {
  it('separates active from completed', () => {
    expect(matchesFilter(makeTodo(), 'active', TODAY)).toBe(true)
    expect(matchesFilter(makeTodo({ done: true }), 'active', TODAY)).toBe(false)
    expect(matchesFilter(makeTodo({ done: true }), 'completed', TODAY)).toBe(true)
  })

  it('treats today as today plus overdue', () => {
    expect(matchesFilter(makeTodo({ dueDate: TODAY }), 'today', TODAY)).toBe(true)
    expect(matchesFilter(makeTodo({ dueDate: YESTERDAY }), 'today', TODAY)).toBe(true)
    expect(matchesFilter(makeTodo({ dueDate: TOMORROW }), 'today', TODAY)).toBe(false)
    expect(matchesFilter(makeTodo(), 'today', TODAY)).toBe(false)
  })

  it('stops counting a task as overdue once it is done', () => {
    const late = makeTodo({ dueDate: YESTERDAY })
    expect(matchesFilter(late, 'overdue', TODAY)).toBe(true)
    expect(matchesFilter({ ...late, done: true }, 'overdue', TODAY)).toBe(false)
  })

  it('keeps everything in the all filter', () => {
    expect(matchesFilter(makeTodo({ done: true, dueDate: YESTERDAY }), 'all', TODAY)).toBe(true)
  })
})

describe('matchesSearch', () => {
  it('matches case insensitively', () => {
    expect(matchesSearch(makeTodo({ text: 'Buy Milk' }), 'milk')).toBe(true)
  })

  it('matches everything when the query is blank', () => {
    expect(matchesSearch(makeTodo({ text: 'Buy Milk' }), '   ')).toBe(true)
  })

  it('rejects tasks that do not contain the query', () => {
    expect(matchesSearch(makeTodo({ text: 'Buy Milk' }), 'dog')).toBe(false)
  })
})

describe('sortTodos', () => {
  const older = makeTodo({ id: 'older', text: 'Older', createdAt: '2026-09-01T10:00:00.000Z' })
  const newer = makeTodo({ id: 'newer', text: 'Newer', createdAt: '2026-09-05T10:00:00.000Z' })

  it('puts the newest first by default', () => {
    expect(sortTodos([older, newer], 'newest').map((todo) => todo.text)).toEqual(['Newer', 'Older'])
  })

  it('sorts by due date and keeps undated tasks last', () => {
    const soon = makeTodo({ text: 'Soon', dueDate: '2026-09-30' })
    const later = makeTodo({ text: 'Later', dueDate: '2026-10-10' })
    const undated = makeTodo({ text: 'Undated' })

    expect(sortTodos([undated, later, soon], 'dueDate').map((todo) => todo.text)).toEqual([
      'Soon',
      'Later',
      'Undated',
    ])
  })

  it('sorts by priority and keeps unranked tasks last', () => {
    const high = makeTodo({ text: 'High', priority: 'high' })
    const low = makeTodo({ text: 'Low', priority: 'low' })
    const none = makeTodo({ text: 'None' })

    expect(sortTodos([none, low, high], 'priority').map((todo) => todo.text)).toEqual([
      'High',
      'Low',
      'None',
    ])
  })
})

describe('selectTodos', () => {
  it('combines filter, search and sort', () => {
    const todos = [
      makeTodo({ text: 'Buy milk', priority: 'low' }),
      makeTodo({ text: 'Buy bread', priority: 'high' }),
      makeTodo({ text: 'Walk dog', priority: 'high' }),
    ]

    const result = selectTodos(todos, { filter: 'all', query: 'buy', sortBy: 'priority' })

    expect(result.map((todo) => todo.text)).toEqual(['Buy bread', 'Buy milk'])
  })
})

describe('emptyMessage', () => {
  it('mentions the search term when searching', () => {
    expect(emptyMessage('all', 'milk')).toBe('No tasks match "milk".')
  })

  it('describes each filter', () => {
    expect(emptyMessage('overdue', '')).toBe('Nothing overdue.')
    expect(emptyMessage('today', '')).toBe('Nothing due today.')
  })
})
