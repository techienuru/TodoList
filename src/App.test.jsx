import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App.jsx'
import { STORAGE_KEY } from './hooks/useTodos.js'

const EMPTY_MESSAGE = 'No tasks yet. Add one above to get started.'

async function addTask(user, text) {
  await user.type(screen.getByLabelText('New task'), text)
  await user.click(screen.getByRole('button', { name: 'Add' }))
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

    const tasks = screen.getAllByRole('checkbox')
    expect(tasks).toHaveLength(2)
    expect(screen.getAllByRole('listitem')[0]).toHaveTextContent('Second')
  })

  it('keeps tasks after a reload', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await addTask(user, 'Persist me')

    unmount()
    render(<App />)

    expect(screen.getByText('Persist me')).toBeInTheDocument()
    expect(screen.getByText('1 of 1 remaining')).toBeInTheDocument()
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY))).toHaveLength(1)
  })

  it('loads saved tasks on first render', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: '1', text: 'Saved task', done: true, createdAt: '2026-01-01T00:00:00.000Z' }]),
    )

    render(<App />)

    expect(screen.getByText('Saved task')).toBeInTheDocument()
    expect(screen.getByRole('checkbox')).toHaveAttribute('aria-checked', 'true')
  })

  it('starts empty when the saved data is corrupted', () => {
    window.localStorage.setItem(STORAGE_KEY, 'not json at all')

    render(<App />)

    expect(screen.getByText(EMPTY_MESSAGE)).toBeInTheDocument()
  })
})
