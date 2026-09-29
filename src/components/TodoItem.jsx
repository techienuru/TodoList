import { useEffect, useRef, useState } from 'react'

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

export function TodoItem({ todo, onToggle, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false)
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
    onUpdate(todo.id, draft)
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
    <li className="flex items-center gap-3 py-2">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.done}
        aria-label={`Mark "${todo.text}" as ${todo.done ? 'not done' : 'done'}`}
        onClick={() => onToggle(todo.id)}
        className={`flex size-5 shrink-0 items-center justify-center rounded-xs border transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50 ${
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
          className={`min-h-9 w-full min-w-0 flex-1 truncate rounded-sm px-2 text-left text-base focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50 ${
            todo.done ? 'text-ink-subtle line-through' : 'text-ink'
          }`}
        >
          {todo.text}
        </button>
      )}

      <button
        type="button"
        aria-label={`Delete "${todo.text}"`}
        onClick={() => onDelete(todo.id)}
        className="flex size-9 shrink-0 items-center justify-center rounded-md text-ink-tertiary transition-colors hover:bg-surface-2 hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50"
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
