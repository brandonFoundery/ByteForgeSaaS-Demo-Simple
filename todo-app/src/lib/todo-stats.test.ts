import { describe, expect, it } from "vitest";
import { clearCompleted, countByStatus } from "./todo-stats";

describe("countByStatus", () => {
  it("counts active and completed todos", () => {
    const todos = [
      { id: 1, completed: false },
      { id: 2, completed: true },
      { id: 3, completed: false },
      { id: 4, completed: true },
      { id: 5, completed: false },
    ];

    expect(countByStatus(todos)).toEqual({ active: 3, completed: 2 });
  });

  it("returns zero counts for an empty list", () => {
    expect(countByStatus([])).toEqual({ active: 0, completed: 0 });
  });
});

describe("clearCompleted", () => {
  it("removes completed todos and returns the remaining active ones", () => {
    const activeTodo = { id: 1, text: "Write tests", completed: false };
    const completedTodo = { id: 2, text: "Implement helper", completed: true };
    const anotherActiveTodo = { id: 3, text: "Run tests", completed: false };

    expect(clearCompleted([activeTodo, completedTodo, anotherActiveTodo])).toEqual([
      activeTodo,
      anotherActiveTodo,
    ]);
  });

  it("returns an empty list when every todo is completed", () => {
    expect(clearCompleted([
      { id: 1, completed: true },
      { id: 2, completed: true },
    ])).toEqual([]);
  });
});
