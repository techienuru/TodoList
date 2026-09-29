import { useMemo, useState } from 'react'
import { EmptyState } from './components/EmptyState.jsx'
import { FilterBar } from './components/FilterBar.jsx'
import { TodoInput } from './components/TodoInput.jsx'
import { TodoList } from './components/TodoList.jsx'
import { useTodos } from './hooks/useTodos.js'

const EMPTY_MESSAGES = {
  all: 'No tasks yet. Add one above to get started.',
  active: 'No active tasks. Everything is done.',
  completed: 'No completed tasks yet.',
}

export default function App() {
  const { todos, addTodo, updateTodo, toggleTodo, deleteTodo } = useTodos()
  const [filter, setFilter] = useState('all')

  const visibleTodos = useMemo(() => {
    if (filter === 'active') return todos.filter((todo) => !todo.done)
    if (filter === 'completed') return todos.filter((todo) => todo.done)
    return todos
  }, [todos, filter])

  const remaining = todos.filter((todo) => !todo.done).length

  return (
    <main className="min-h-screen bg-canvas px-4 py-10 sm:py-16">
      <div className="mx-auto flex w-full max-w-[600px] flex-col gap-6 rounded-xl border border-hairline bg-surface-1 p-6 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
        <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <h1 className="text-[28px] font-semibold tracking-[-0.6px] text-ink">Tasks</h1>
          <p className="text-xs text-ink-subtle">
            {todos.length === 0 ? 'Nothing here yet' : `${remaining} of ${todos.length} remaining`}
          </p>
        </header>

        <TodoInput onAdd={addTodo} />

        <div className="flex flex-col gap-6 border-t border-hairline pt-6">
          {visibleTodos.length > 0 ? (
            <TodoList
              todos={visibleTodos}
              onToggle={toggleTodo}
              onUpdate={updateTodo}
              onDelete={deleteTodo}
            />
          ) : (
            <EmptyState message={EMPTY_MESSAGES[filter]} />
          )}

          <FilterBar value={filter} onChange={setFilter} />
        </div>
      </div>
    </main>
  )
}
