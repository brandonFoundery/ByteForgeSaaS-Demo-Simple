export interface CompletableTodo {
  completed: boolean;
}

/** Returns the active todos, excluding all completed items. */
export function clearCompleted<T extends CompletableTodo>(todos: T[]): T[] {
  return todos.filter((todo) => !todo.completed);
}
