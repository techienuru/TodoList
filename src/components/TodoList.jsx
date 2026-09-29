import { TodoItem } from './TodoItem.jsx'

export function TodoList({ todos, onToggle, onUpdate, onDelete }) {
  return (
    <ul className="divide-y divide-hairline">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </ul>
  )
}
