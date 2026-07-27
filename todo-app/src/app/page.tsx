"use client";

import { useMemo, useState } from "react";

import MedicationAdherenceCard from "@/components/MedicationAdherenceCard";
import type { DoseRecord, Medication } from "@/lib/adherence";

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

/** Builds a 30-day dose log where roughly `takenRatio` of doses were taken. */
function buildDoseLog(now: number, takenRatio: number): DoseRecord[] {
  const days = 30;
  const takenCount = Math.round(days * takenRatio);
  return Array.from({ length: days }, (_, i) => ({
    date: new Date(now - i * 24 * 60 * 60 * 1000).toISOString(),
    taken: i < takenCount,
  }));
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [inputValue, setInputValue] = useState("");

  const medications = useMemo<Medication[]>(() => {
    const now = Date.now();
    return [
      {
        id: "lisinopril",
        name: "Lisinopril",
        dosage: "10 mg daily",
        doses: buildDoseLog(now, 0.93),
      },
      {
        id: "metformin",
        name: "Metformin",
        dosage: "500 mg twice daily",
        doses: buildDoseLog(now, 0.67),
      },
    ];
  }, []);

  const addTodo = () => {
    if (inputValue.trim() === "") return;

    const newTodo: Todo = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
    };

    setTodos([...todos, newTodo]);
    setInputValue("");
  };

  const toggleTodo = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      addTodo();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-8">
          Todo App
        </h1>

        {/* Medication Adherence */}
        <div className="mb-6">
          <MedicationAdherenceCard medications={medications} />
        </div>

        {/* Add Todo Input */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add a new todo..."
            className="flex-1 px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
          />
          <button
            onClick={addTodo}
            className="px-6 py-3 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
          >
            Add
          </button>
        </div>

        {/* Todo List */}
        <div className="space-y-3">
          {todos.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No todos yet. Add one above!
            </p>
          ) : (
            todos.map((todo) => (
              <div
                key={todo.id}
                className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm border border-gray-100"
              >
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                  className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500 cursor-pointer"
                />
                <span
                  className={`flex-1 ${
                    todo.completed
                      ? "line-through text-gray-400"
                      : "text-gray-700"
                  }`}
                >
                  {todo.text}
                </span>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="px-3 py-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>

        {/* Todo Count */}
        {todos.length > 0 && (
          <p className="text-center text-gray-500 mt-6">
            {todos.filter((t) => !t.completed).length} of {todos.length} todos
            remaining
          </p>
        )}
      </div>
    </div>
  );
}
