import { useEffect, useRef, useState } from 'react'
import { dueDateLabel, isOverdue } from '../lib/dates.js'
import { priorityDotClass, priorityLabel } from '../lib/priority.js'

const FOCUS_RING = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50'

function CheckIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3.5 8.5 6.5 11.5 12.5 5" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      aria-hidden="true"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2.5" y="3.5" width="11" height="10" rx="2" />
      <path d="M2.5 6.5h11M5.5 2.5v2M10.5 2.5v2" />
    </svg>
  )
}

const PRIORITY_OPTIONS = [
  { value: '', label: 'No priority' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingDue, setIsEditingDue] = useState(false)
  const [draft, setDraft] = useState(todo.text)
  const inputRef = useRef(null)

  useEffect(() => {
    if (isEditing) inputRef.current?.select()
  }, [isEditing])

  function startEditing() {
    setDraft(todo.text)
    setIsEditing(true)
  }

  function finishEditing() {
    onUpdate(todo.id, { text: draft })
    setIsEditing(false)
  }

  function cancelEditing() {
    setDraft(todo.text)
    setIsEditing(false)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault()
      finishEditing()
    } else if (event.key === 'Escape') {
      event.preventDefault()
      cancelEditing()
    }
  }

  return (
    <li className="flex items-center gap-2 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        aria-label={`Mark "${todo.text}" as ${todo.done ? 'not done' : 'done'}`}
        onClick={() => onToggle(todo.id)}
        className={`flex size-5 shrink-0 items-center justify-center rounded-xs border transition-colors ${FOCUS_RING} ${
          todo.done
            ? 'border-primary bg-primary text-white'
            : 'border-hairline-strong bg-surface-2 text-transparent hover:border-hairline-tertiary'
        }`}
      >
        <CheckIcon />
      </button>

      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={finishEditing}
          aria-label={`Edit "${todo.text}"`}
          className="min-h-9 w-full min-w-0 flex-1 rounded-sm border border-hairline-strong bg-surface-2 px-2 text-base text-ink focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-focus/50"
        />
      ) : (
        <button
          type="button"
          onClick={startEditing}
          title="Click to edit"
          className={`min-h-9 w-full min-w-0 flex-1 truncate rounded-sm px-2 text-left text-base ${FOCUS_RING} ${
            todo.done ? 'text-ink-subtle line-through' : 'text-ink'
          }`}
        >
          {todo.text}
        </button>
      )}

      <select
        value={todo.priority ?? ''}
        onChange={(event) => onUpdate(todo.id, { priority: event.target.value || null })}
        aria-label={`Priority for "${todo.text}"`}
        title={`Priority: ${priorityLabel(todo.priority)}`}
        className={`size-5 shrink-0 cursor-pointer appearance-none rounded-full border border-hairline-strong text-transparent ${FOCUS_RING} ${priorityDotClass(todo.priority)}`}
      >
        {PRIORITY_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {isEditingDue ? (
        <input
          type="date"
          value={todo.dueDate ?? ''}
          onChange={(event) => onUpdate(todo.id, { dueDate: event.target.value || null })}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === 'Escape') setIsEditingDue(false)
          }}
          onBlur={() => setIsEditingDue(false)}
          aria-label={`Due date for "${todo.text}"`}
          autoFocus
          className="min-h-9 shrink-0 rounded-sm border border-hairline-strong bg-surface-2 px-2 text-sm text-ink focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-focus/50"
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditingDue(true)}
          aria-label={`Due date for "${todo.text}"`}
          title="Set due date"
          className={`flex min-h-9 shrink-0 items-center gap-1 rounded-sm px-2 text-xs transition-colors hover:bg-surface-2 ${FOCUS_RING} ${
            isOverdue(todo) ? 'text-ink-muted' : 'text-ink-tertiary'
          }`}
        >
          <CalendarIcon />
          {todo.dueDate ? <span>{dueDateLabel(todo)}</span> : null}
        </button>
      )}

      <button
        type="button"
        aria-label={`Delete "${todo.text}"`}
        onClick={() => onDelete(todo.id)}
        className={`flex size-9 shrink-0 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-ink ${FOCUS_RING}`}
      >
        <svg
          viewBox="0 0 16 16"
          aria-hidden="true"
          className="size-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        >
          <path d="M4 4l8 8M12 4l-8 8" />
        </svg>
      </button>
    </li>
  )
}
