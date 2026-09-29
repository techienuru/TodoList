import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState.jsx'
import { FilterBar } from './components/FilterBar.jsx'
import { SearchInput } from './components/SearchInput.jsx'
import { SortControl } from './components/SortControl.jsx'
import { TodoInput } from './components/TodoInput.jsx'
import { TodoList } from './components/TodoList.jsx'
import { useTodos } from './hooks/useTodos.js'
import { isOverdue } from './lib/dates.js'
import { emptyMessage, selectTodos } from './lib/tasks.js'

export default function App() {
  const { todos, addTodo, updateTodo, toggleTodo, deleteTodo, clearCompleted } = useTodos()
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')

  const visibleTodos = useMemo(
    () => selectTodos(todos, { filter, query, sortBy }),
    [todos, filter, query, sortBy],
  )

  const remaining = todos.filter((todo) => !todo.done).length
  const overdueCount = todos.filter((todo) => isOverdue(todo)).length
  const hasCompleted = todos.some((todo) => todo.done)

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-[640px] flex-col gap-6 rounded-xl border border-hairline bg-surface-1 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-[28px] font-semibold tracking-[-0.6px] text-ink">Tasks</h1>
          <p className="text-xs text-ink-subtle">
            {todos.length === 0 ? 'Nothing here yet' : `${remaining} of ${todos.length} remaining`}
            {overdueCount > 0 ? ` (${overdueCount} overdue)` : ''}
          </p>
        </header>

        <SearchInput value={query} onChange={setQuery} />

        <TodoInput onAdd={addTodo} />

        <div className="border-t border-hairline pt-6">
          {visibleTodos.length > 0 ? (
            <TodoList
              todos={visibleTodos}
              onToggle={toggleTodo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ) : (
            <EmptyState message={emptyMessage(filter, query)} />
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-hairline pt-6">
          <FilterBar value={filter} onChange={setFilter} />
          <div className="flex flex-wrap items-center gap-2">
            <SortControl value={sortBy} onChange={setSortBy} />
            {hasCompleted ? (
              <button
                type="button"
                onClick={clearCompleted}
                className="min-h-9 rounded-md border border-hairline bg-surface-2 px-3.5 text-sm font-medium text-ink transition-colors hover:bg-surface-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50"
              >
                Clear completed
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  )
}
