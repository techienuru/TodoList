import { useCallback, useEffect, useState } from 'react'
import { PRIORITIES } from '../lib/priority.js'

export const STORAGE_KEY = 'todos'

const PRIORITY_VALUES = PRIORITIES.map((priority) => priority.value)
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function normalizeTodo(todo) {
  return {
    id: todo.id ? String(todo.id) : createId(),
    text: todo.text,
    done: Boolean(todo.done),
    createdAt: typeof todo.createdAt === 'string' ? todo.createdAt : new Date().toISOString(),
    dueDate: typeof todo.dueDate === 'string' && DATE_PATTERN.test(todo.dueDate) ? todo.dueDate : null,
    priority: PRIORITY_VALUES.includes(todo.priority) ? todo.priority : null,
  }
}

function loadTodos() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((todo) => todo && typeof todo.text === 'string').map(normalizeTodo)
  } catch {
    return []
  }
}

export function useTodos() {
  const [todos, setTodos] = useState(loadTodos)

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
    } catch {
      // Storage can be blocked or full; the list still works for this session.
    }
  }, [todos])

  const addTodo = useCallback((text, { dueDate = null, priority = null } = {}) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((current) => [
      {
        id: createId(),
        text: trimmed,
        done: false,
        createdAt: new Date().toISOString(),
        dueDate,
        priority,
      },
      ...current,
    ])
  }, [])

  const updateTodo = useCallback((id, patch) => {
    setTodos((current) =>
      current.map((todo) => {
        if (todo.id !== id) return todo
        if (typeof patch.text === 'string') {
          const trimmed = patch.text.trim()
          if (!trimmed) return todo
          return { ...todo, ...patch, text: trimmed }
        }
        return { ...todo, ...patch }
      }),
    )
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos((current) =>
      current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)),
    )
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }, [])

  const clearCompleted = useCallback(() => {
    setTodos((current) => current.filter((todo) => !todo.done))
  }, [])

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo, clearCompleted }
}
