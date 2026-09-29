import { useCallback, useEffect, useState } from 'react'

export const STORAGE_KEY = 'todos'

function createId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

function loadTodos() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((todo) => todo && typeof todo.text === 'string')
      .map((todo) => ({
        id: todo.id ? String(todo.id) : createId(),
        text: todo.text,
        done: Boolean(todo.done),
        createdAt: typeof todo.createdAt === 'string' ? todo.createdAt : new Date().toISOString(),
      }))
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

  const addTodo = useCallback((text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((current) => [
      { id: createId(), text: trimmed, done: false, createdAt: new Date().toISOString() },
      ...current,
    ])
  }, [])

  const updateTodo = useCallback((id, text) => {
    const trimmed = text.trim()
    if (!trimmed) return
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, text: trimmed } : todo)))
  }, [])

  const toggleTodo = useCallback((id) => {
    setTodos((current) => current.map((todo) => (todo.id === id ? { ...todo, done: !todo.done } : todo)))
  }, [])

  const deleteTodo = useCallback((id) => {
    setTodos((current) => current.filter((todo) => todo.id !== id))
  }, [])

  return { todos, addTodo, updateTodo, toggleTodo, deleteTodo }
}
