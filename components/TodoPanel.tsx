import React, { useEffect, useMemo, useState } from 'react';

interface TodoItem {
  id: string;
  text: string;
  done: boolean;
  createdAt: string;
  completedAt?: string;
  dueDate?: string;
}

const TODO_STORAGE_KEY = 'zcanic_todos_v1';
const DATE_RE = /^(\d{8})\s*第([1-6])节课$/;

const parseDueDate = (value?: string): { dateKey: number; slot: number } | null => {
  if (!value) return null;
  const match = value.match(DATE_RE);
  if (!match) return null;
  const yyyymmdd = match[1];
  const slot = Number.parseInt(match[2], 10);
  const year = Number.parseInt(yyyymmdd.slice(0, 4), 10);
  const month = Number.parseInt(yyyymmdd.slice(4, 6), 10);
  const day = Number.parseInt(yyyymmdd.slice(6, 8), 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) return null;
  const dateKey = Date.UTC(year, month - 1, day);
  if (!Number.isFinite(dateKey)) return null;
  return { dateKey, slot };
};

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
        const completedAt =
          typeof rec.completedAt === 'string' && rec.completedAt.trim()
            ? rec.completedAt
            : done
              ? createdAt
              : undefined;
        const dueRaw = typeof rec.dueDate === 'string' && rec.dueDate.trim() ? rec.dueDate.trim() : undefined;
        const dueDate = parseDueDate(dueRaw) ? dueRaw : undefined;
        if (!id || !todoText) return null;
        return { id, text: todoText, done, createdAt, completedAt, dueDate };
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
  const sortedTodos = useMemo(() => {
    const pending = todos.filter((item) => !item.done);
    const done = todos.filter((item) => item.done);

    const byCreatedDesc = (a: TodoItem, b: TodoItem) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();

    const pendingSorted = [...pending].sort((a, b) => {
      const aHasDate = Boolean(a.dueDate);
      const bHasDate = Boolean(b.dueDate);

      if (aHasDate && bHasDate) {
        const aDue = parseDueDate(a.dueDate);
        const bDue = parseDueDate(b.dueDate);
        if (aDue && bDue) {
          if (aDue.dateKey !== bDue.dateKey) return aDue.dateKey - bDue.dateKey;
          if (aDue.slot !== bDue.slot) return aDue.slot - bDue.slot;
        }
        return byCreatedDesc(a, b);
      }
      if (aHasDate !== bHasDate) return aHasDate ? -1 : 1;
      return byCreatedDesc(a, b);
    });

    const doneSorted = [...done].sort((a, b) => {
      const aTime = a.completedAt ? new Date(a.completedAt).getTime() : 0;
      const bTime = b.completedAt ? new Date(b.completedAt).getTime() : 0;
      if (aTime !== bTime) return bTime - aTime;
      return byCreatedDesc(a, b);
    });

    return [...pendingSorted, ...doneSorted];
  }, [todos]);

  const addTodo = () => {
    const text = input.trim();
    if (!text) return;

    setTodos((prev) => [
      {
        id: `todo-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        text,
                done: false,
                createdAt: new Date().toISOString(),
                dueDate: undefined,
                completedAt: undefined,
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
            {sortedTodos.map((item) => (
              <div
                key={item.id}
                className={`rounded-xl border px-3 py-2 flex items-center gap-2 ${
                  item.done ? 'bg-slate-100 border-slate-200' : 'bg-cyan-50 border-cyan-100'
                }`}
              >
                <button
                  onClick={() =>
                    setTodos((prev) =>
                      prev.map((todo) => {
                        if (todo.id !== item.id) return todo;
                        const nextDone = !todo.done;
                        return {
                          ...todo,
                          done: nextDone,
                          completedAt: nextDone ? new Date().toISOString() : undefined,
                        };
                      }),
                    )
                  }
                  className={`w-5 h-5 rounded-md border text-[10px] font-black flex items-center justify-center ${
                    item.done
                      ? 'bg-slate-400 border-slate-400 text-white'
                      : 'bg-white border-slate-300 text-slate-400'
                  }`}
                  aria-label="toggle todo"
                >
                  {item.done ? '✓' : ''}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-bold break-words whitespace-pre-wrap ${item.done ? 'text-slate-500 line-through' : 'text-cyan-800'}`}>
                    {item.text}
                  </div>
                  {item.dueDate && (
                    <div className="text-[10px] mt-1 text-slate-500">Date: {item.dueDate}</div>
                  )}
                </div>
                {!item.done ? (
                  <button
                    onClick={() => {
                      const next = window.prompt('设置日期（YYYYMMDD 第N节课），留空清除：', item.dueDate ?? '');
                      if (next === null) return;
                      const normalized = next.trim();
                      if (normalized && !parseDueDate(normalized)) {
                        window.alert('日期格式需为：YYYYMMDD 第N节课（N=1~6）');
                        return;
                      }
                      setTodos((prev) =>
                        prev.map((todo) =>
                          todo.id === item.id
                            ? { ...todo, dueDate: normalized || undefined }
                            : todo,
                        ),
                      );
                    }}
                    className="px-2 py-1 rounded-md text-[10px] font-black text-cyan-700 hover:bg-cyan-100"
                  >
                    Date
                  </button>
                ) : (
                  <button
                    onClick={() => setTodos((prev) => prev.filter((todo) => todo.id !== item.id))}
                    className="px-2 py-1 rounded-md text-[10px] font-black text-slate-500 hover:bg-slate-200"
                  >
                    删除
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TodoPanel;
