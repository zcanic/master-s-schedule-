import React, { useEffect, useMemo, useState } from 'react';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
}

const TODO_STORAGE_KEY = 'zcanic_todos_v1';

const readTodos = (): TodoItem[] => {
  try {
    const text = localStorage.getItem(TODO_STORAGE_KEY);
    if (!text) return [];
    const parsed: unknown = JSON.parse(text);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .map((item): TodoItem | null => {
        if (typeof item !== 'object' || item === null) return null;
        const rec = item as Record<string, unknown>;
        const id = typeof rec.id === 'string' ? rec.id : '';
        const todoText = typeof rec.text === 'string' ? rec.text.trim() : '';
        const done = Boolean(rec.done);
        const createdAt = typeof rec.createdAt === 'string' ? rec.createdAt : new Date().toISOString();
        if (!id || !todoText) return null;
        return { id, text: todoText, done, createdAt };
      })
      .filter((v): v is TodoItem => v !== null);
  } catch (e) {
    return [];
  }
};

const TodoPanel: React.FC = () => {
  const [todos, setTodos] = useState<TodoItem[]>(() => readTodos());
  const [input, setInput] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(TODO_STORAGE_KEY, JSON.stringify(todos));
    } catch (e) {
      console.warn('Failed to persist TODO items.');
    }
  }, [todos]);

  const pendingCount = useMemo(() => todos.filter((item) => !item.done).length, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;

    setTodos((prev) => [
      {
        id: `todo-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        text,
        done: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setInput('');
  };

  return (
    <div className="h-full flex flex-col gap-3">
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-black text-slate-800">TODO BOARD</h2>
          <span className="text-[10px] font-bold text-slate-400">
            待完成 {pendingCount} / 总计 {todos.length}
          </span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
            }}
            placeholder="输入一条待办..."
            className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-300"
          />
          <button
            onClick={addTodo}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-black hover:bg-slate-800 transition-colors"
          >
            ADD
          </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-2xl border border-slate-100 shadow-sm p-3 sm:p-4 overflow-y-auto hide-scrollbar">
        {todos.length === 0 ? (
          <div className="h-full min-h-[140px] flex items-center justify-center text-xs font-bold text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
            暂无待办，先添加一条
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {todos.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${
                  item.done ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'
                }`}
              >
                <button
                  onClick={() =>
                    setTodos((prev) =>
                      prev.map((todo) => (todo.id === item.id ? { ...todo, done: !todo.done } : todo)),
                    )
                  }
                  className={`w-5 h-5 rounded-md border text-[10px] font-black flex items-center justify-center ${
                    item.done
                      ? 'bg-emerald-500 border-emerald-500 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                  aria-label="toggle todo"
                >
                  {item.done ? '✓' : ''}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold truncate ${item.done ? 'text-emerald-700 line-through' : 'text-slate-700'}`}>
                    {item.text}
                  </div>
                  <div className="text-[10px] text-slate-400">{new Date(item.createdAt).toLocaleString()}</div>
                </div>
                <button
                  onClick={() => setTodos((prev) => prev.filter((todo) => todo.id !== item.id))}
                  className="px-2 py-1 rounded-md text-[10px] font-black text-rose-500 hover:bg-rose-50"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPanel;
