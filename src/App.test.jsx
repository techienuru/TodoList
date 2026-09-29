import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App.jsx'
import { STORAGE_KEY } from './hooks/useTodos.js'
import { formatDueDate, todayISO } from './lib/dates.js'

const EMPTY_MESSAGE = 'No tasks yet. Add one above to get started.'
const TODAY = todayISO()
const YESTERDAY = todayISO(new Date(Date.now() - 24 * 60 * 60 * 1000))
const NEXT_WEEK = todayISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))

async function addTask(user, text, { dueDate, priority } = {}) {
  await user.type(screen.getByLabelText('New task'), text)
  if (dueDate) {
    fireEvent.change(screen.getByLabelText('Due date'), { target: { value: dueDate } })
  }
  if (priority) {
    await user.selectOptions(screen.getByLabelText('Priority'), priority)
  }
  await user.click(screen.getByRole('button', { name: 'Add' }))
}

function rowTexts() {
  return screen.getAllByRole('listitem').map((row) => row.textContent)
}

describe('todo app', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it('shows an empty state before anything is added', () => {
    render(<App />)

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument()
    expect(screen.getByText('Nothing here yet')).toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
    expect(screen.queryByRole('button', { name: 'Clear completed' })).not.toBeInTheDocument()
  })

  it('adds a task and clears the input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, 'Buy milk')

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.getByLabelText('New task')).toHaveValue('')
    expect(screen.getByText('1 of 1 remaining')).toBeInTheDocument()
  })

  it('ignores blank input', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'Add' }))
    await addTask(user, '   ')

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument()
    expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
  })

  it('marks a task as done and back again', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Write tests')

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByText('0 of 1 remaining')).toBeInTheDocument()

    await user.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
    expect(screen.getByText('1 of 1 remaining')).toBeInTheDocument()
  })

  it('edits a task by clicking its text', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Draft report')

    await user.click(screen.getByRole('button', { name: 'Draft report' }))
    const editor = screen.getByLabelText('Edit "Draft report"')
    await user.clear(editor)
    await user.type(editor, 'Send report{Enter}')

    expect(screen.getByRole('button', { name: 'Send report' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Draft report' })).not.toBeInTheDocument()
  })

  it('cancels an edit when Escape is pressed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Keep me')

    await user.click(screen.getByRole('button', { name: 'Keep me' }))
    const editor = screen.getByLabelText('Edit "Keep me"')
    await user.clear(editor)
    await user.type(editor, 'Discard me{Escape}')

    expect(screen.getByRole('button', { name: 'Keep me' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Discard me' })).not.toBeInTheDocument()
  })

  it('keeps the original text when an edit is left empty', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Leave me alone')

    await user.click(screen.getByRole('button', { name: 'Leave me alone' }))
    const editor = screen.getByLabelText('Edit "Leave me alone"')
    await user.clear(editor)
    await user.type(editor, '{Enter}')

    expect(screen.getByRole('button', { name: 'Leave me alone' })).toBeInTheDocument()
  })

  it('deletes a task', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Throw away')

    await user.click(screen.getByLabelText('Delete "Throw away"'))

    expect(screen.queryByText('Throw away')).not.toBeInTheDocument()
    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument()
  })

  it('filters tasks by active and completed', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Task A')
    await addTask(user, 'Task B')

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Task B" as done' }))

    await user.click(screen.getByRole('button', { name: 'Active' }))
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.queryByText('Task B')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Completed' }))
    expect(screen.getByText('Task B')).toBeInTheDocument()
    expect(screen.queryByText('Task A')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'All' }))
    expect(screen.getByText('Task A')).toBeInTheDocument()
    expect(screen.getByText('Task B')).toBeInTheDocument()
  })

  it('shows the newest task first', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'First')
    await addTask(user, 'Second')

    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Second')
  })

  it('keeps tasks after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addTask(user, 'Persist me', { dueDate: TODAY, priority: 'high' })

    unmount()
    render(<App />)

    expect(screen.getByText('Persist me')).toBeInTheDocument()
    expect(screen.getByLabelText('Priority for "Persist me"')).toHaveValue('high')
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toHaveLength(1)
  })

  it('loads saved tasks on first render', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: '1', text: 'Saved task', done: true, createdAt: '2026-01-01T00:00:00.000Z' },
      ]),
    )

    render(<App />)

    expect(screen.getByText('Saved task')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
    expect(screen.getByLabelText('Priority for "Saved task"')).toHaveValue('')
  })

  it('starts empty when the saved data is corrupted', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json at all')

    render(<App />)

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument()
  })

  it('saves a due date with a new task and shows it on the row', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, 'Pay rent', { dueDate: NEXT_WEEK })

    expect(screen.getByText(formatDueDate(NEXT_WEEK))).toBeInTheDocument()
    expect(screen.getByLabelText('Due date')).toHaveValue('')
  })

  it('saves a priority with a new task', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, 'Fix bug', { priority: 'high' })

    expect(screen.getByLabelText('Priority for "Fix bug"')).toHaveValue('high')
    expect(screen.getByLabelText('Priority')).toHaveValue('')
  })

  it('changes the due date and priority of an existing task', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Renew passport')

    await user.click(screen.getByLabelText('Due date for "Renew passport"'))
    fireEvent.change(screen.getByLabelText('Due date for "Renew passport"'), {
      target: { value: TODAY },
    })
    await user.selectOptions(screen.getByLabelText('Priority for "Renew passport"'), 'low')

    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY))[0]
    expect(saved.dueDate).toBe(TODAY)
    expect(saved.priority).toBe('low')
  })

  it('labels a task due today as due today', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, 'Today task', { dueDate: TODAY })

    expect(screen.getByText('Due today')).toBeInTheDocument()
  })

  it('shows overdue tasks with an overdue label', async () => {
    const user = userEvent.setup()
    render(<App />)

    await addTask(user, 'Late thing', { dueDate: YESTERDAY })

    expect(screen.getByText(`Overdue: ${formatDueDate(YESTERDAY)}`)).toBeInTheDocument()
    expect(screen.getByText('1 of 1 remaining (1 overdue)')).toBeInTheDocument()
  })

  it('shows today and overdue tasks in the Today view', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Today task', { dueDate: TODAY })
    await addTask(user, 'Late task', { dueDate: YESTERDAY })
    await addTask(user, 'Future task', { dueDate: NEXT_WEEK })
    await addTask(user, 'Undated task')

    await user.click(screen.getByRole('button', { name: 'Today' }))

    expect(screen.getByText('Today task')).toBeInTheDocument()
    expect(screen.getByText('Late task')).toBeInTheDocument()
    expect(screen.queryByText('Future task')).not.toBeInTheDocument()
    expect(screen.queryByText('Undated task')).not.toBeInTheDocument()
  })

  it('stops showing a finished task as overdue', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Late thing', { dueDate: YESTERDAY })

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Late thing" as done' }))
    await user.click(screen.getByRole('button', { name: 'Overdue' }))

    expect(screen.getByText('Nothing overdue.')).toBeInTheDocument()
    expect(screen.queryByText('Late thing')).not.toBeInTheDocument()
  })

  it('searches tasks by text', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Buy milk')
    await addTask(user, 'Walk dog')

    await user.type(screen.getByLabelText('Search tasks'), 'milk')

    expect(screen.getByText('Buy milk')).toBeInTheDocument()
    expect(screen.queryByText('Walk dog')).not.toBeInTheDocument()
  })

  it('combines search with the active filter and explains an empty result', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Buy milk')
    await addTask(user, 'Buy bread')

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Buy bread" as done' }))
    await user.click(screen.getByRole('button', { name: 'Active' }))
    await user.type(screen.getByLabelText('Search tasks'), 'bread')

    expect(screen.getByText('No tasks match "bread".')).toBeInTheDocument()
    expect(screen.queryByText('Buy milk')).not.toBeInTheDocument()
  })

  it('sorts by due date with undated tasks last', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Undated')
    await addTask(user, 'Later', { dueDate: NEXT_WEEK })
    await addTask(user, 'Sooner', { dueDate: TODAY })

    await user.selectOptions(screen.getByLabelText('Sort tasks'), 'dueDate')

    const rows = rowTexts()
    expect(rows[0]).toContain('Sooner')
    expect(rows[1]).toContain('Later')
    expect(rows[2]).toContain('Undated')
  })

  it('sorts by priority with unranked tasks last', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'No priority task')
    await addTask(user, 'Low task', { priority: 'low' })
    await addTask(user, 'High task', { priority: 'high' })

    await user.selectOptions(screen.getByLabelText('Sort tasks'), 'priority')

    const rows = rowTexts()
    expect(rows[0]).toContain('High task')
    expect(rows[1]).toContain('Low task')
    expect(rows[2]).toContain('No priority task')
  })

  it('clears completed tasks in one click', async () => {
    const user = userEvent.setup()
    render(<App />)
    await addTask(user, 'Keep this')
    await addTask(user, 'Finish this')

    await user.click(screen.getByRole('checkbox', { name: 'Mark "Finish this" as done' }))

    const clearButton = screen.getByRole('button', { name: 'Clear completed' })
    await user.click(clearButton)

    expect(screen.queryByText('Finish this')).not.toBeInTheDocument()
    expect(screen.getByText('Keep this')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Clear completed' })).not.toBeInTheDocument()
  })
})
