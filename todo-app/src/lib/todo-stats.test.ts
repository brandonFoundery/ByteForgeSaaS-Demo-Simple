import { describe, expect, it } from "vitest";
import { clearCompleted } from "./todo-stats";

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
