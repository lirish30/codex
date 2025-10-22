'use client';

import { FormEvent, useEffect, useMemo, useReducer, useState } from 'react';
import { v4 as uuid } from 'uuid';

import {
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Input,
} from '@kibocommerce/kiboui';

type Todo = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

type TodoAction =
  | { type: 'load'; payload: Todo[] }
  | { type: 'add'; payload: { title: string } }
  | { type: 'toggle'; payload: { id: string } }
  | { type: 'remove'; payload: { id: string } }
  | { type: 'clearCompleted' };

const STORAGE_KEY = 'kibo-ui-todo-items';

const todoReducer = (state: Todo[], action: TodoAction): Todo[] => {
  switch (action.type) {
    case 'load':
      return action.payload;
    case 'add': {
      const todo: Todo = {
        id: uuid(),
        title: action.payload.title.trim(),
        completed: false,
        createdAt: Date.now(),
      };
      return [todo, ...state];
    }
    case 'toggle':
      return state.map((todo) =>
        todo.id === action.payload.id ? { ...todo, completed: !todo.completed } : todo
      );
    case 'remove':
      return state.filter((todo) => todo.id !== action.payload.id);
    case 'clearCompleted':
      return state.filter((todo) => !todo.completed);
    default:
      return state;
  }
};

type Filter = 'all' | 'active' | 'completed';

const filters: Record<Filter, (todo: Todo) => boolean> = {
  all: () => true,
  active: (todo) => !todo.completed,
  completed: (todo) => todo.completed,
};

export const TodoApp = () => {
  const [todos, dispatch] = useReducer(todoReducer, []);
  const [filter, setFilter] = useState<Filter>('all');
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }
      const parsed = JSON.parse(raw) as Todo[];
      dispatch({ type: 'load', payload: parsed });
    } catch (err) {
      console.warn('Failed to read todos from storage', err);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }, [todos]);

  const filteredTodos = useMemo(() => todos.filter(filters[filter]), [todos, filter]);
  const stats = useMemo(() => {
    const completed = todos.filter((todo) => todo.completed).length;
    const remaining = todos.length - completed;
    return { completed, remaining, total: todos.length };
  }, [todos]);

  const handleAddTodo = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = inputValue.trim();
    if (!value) {
      return;
    }

    dispatch({ type: 'add', payload: { title: value } });
    setInputValue('');
  };

  return (
    <div className="app-shell">
      <Card>
        <CardHeader>
          <h1 className="kibo-card__title">Today&apos;s Focus</h1>
          <p className="kibo-card__subtitle">
            Plan, prioritize, and complete your tasks in Kibo UI dark mode.
          </p>
        </CardHeader>
        <CardBody>
          <form className="todo-input-row" onSubmit={handleAddTodo}>
            <Input
              aria-label="Add a todo"
              placeholder="Capture your next todo..."
              value={inputValue}
              onChange={(event) => setInputValue(event.target.value)}
            />
            <Button type="submit" disabled={!inputValue.trim()}>
              Add
            </Button>
          </form>

          <div className="todo-filters">
            <div className="todo-filters__buttons">
              {(['all', 'active', 'completed'] as Filter[]).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={filter === option ? 'primary' : 'ghost'}
                  onClick={() => setFilter(option)}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1)}
                </Button>
              ))}
            </div>
            <div className="todo-stats">
              {stats.remaining} remaining &middot; {stats.completed} completed
            </div>
          </div>

          {filteredTodos.length === 0 ? (
            <div className="todo-empty">
              {todos.length === 0
                ? 'Start by adding your first todo.'
                : 'Nothing to show for this filter.'}
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <li key={todo.id} className="todo-item">
                  <Checkbox
                    checked={todo.completed}
                    onChange={() => dispatch({ type: 'toggle', payload: { id: todo.id } })}
                    aria-label={`Mark ${todo.title} as complete`}
                  />
                  <p
                    className={`todo-item__title ${
                      todo.completed ? 'todo-item__title--complete' : ''
                    }`}
                  >
                    {todo.title}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => dispatch({ type: 'remove', payload: { id: todo.id } })}
                  >
                    Remove
                  </Button>
                </li>
              ))}
            </ul>
          )}

          <Button
            type="button"
            variant="ghost"
            onClick={() => dispatch({ type: 'clearCompleted' })}
            disabled={stats.completed === 0}
          >
            Clear completed
          </Button>
        </CardBody>
      </Card>
    </div>
  );
};
