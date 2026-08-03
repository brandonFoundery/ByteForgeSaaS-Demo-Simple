export interface CompletableTodo {
  completed: boolean;
}

export interface TodoStatusCounts {
  active: number;
  completed: number;
}

/** Counts active and completed todos. */
export function countByStatus(todos: readonly CompletableTodo[]): TodoStatusCounts {
  return todos.reduce<TodoStatusCounts>(
    (counts, todo) => {
      if (todo.completed) {
        counts.completed += 1;
      } else {
        counts.active += 1;
      }
      return counts;
    },
    { active: 0, completed: 0 },
  );
}

/** Returns the active todos, excluding all completed items. */
export function clearCompleted<T extends CompletableTodo>(todos: T[]): T[] {
  return todos.filter((todo) => !todo.completed);
}
