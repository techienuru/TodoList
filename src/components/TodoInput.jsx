import { useState } from 'react'

const FIELD_CLASS =
  'min-h-9 rounded-md border border-hairline bg-surface-2 px-2 text-sm text-ink focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-focus/50'

export function TodoInput({ onAdd }) {
  const [text, setText] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState('')

  function handleSubmit(event) {
    event.preventDefault()
    const trimmed = text.trim()
    if (!trimmed) return
    onAdd(trimmed, { dueDate: dueDate || null, priority: priority || null })
    setText('')
    setDueDate('')
    setPriority('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="What needs to be done?"
          aria-label="New task"
          className="min-h-11 w-full min-w-0 flex-1 rounded-md border border-hairline bg-surface-2 px-3 text-base text-ink placeholder:text-ink-tertiary focus-visible:border-hairline-strong focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-primary-focus/50"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 rounded-md bg-primary px-3.5 text-sm font-medium text-white transition-colors hover:bg-primary-hover active:bg-primary-focus focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus/50"
        >
          Add
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <input
          type="date"
          value={dueDate}
          onChange={(event) => setDueDate(event.target.value)}
          aria-label="Due date"
          className={FIELD_CLASS}
        />
        <select
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
          aria-label="Priority"
          className={FIELD_CLASS}
        >
          <option value="">No priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>
    </form>
  )
}
