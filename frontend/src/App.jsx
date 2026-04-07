import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const API_URL = '/api/todos';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');
  const [adding, setAdding] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const inputRef = useRef(null);

  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error('불러오기 실패', err);
    }
  };

  useEffect(() => { fetchTodos(); }, []);

  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim() || adding) return;
    setAdding(true);
    try {
      const res = await axios.post(API_URL, { title: input });
      setTodos(prev => [...prev, res.data]);
      setInput('');
      inputRef.current?.focus();
    } catch (err) {
      console.error('추가 실패', err);
    } finally {
      setAdding(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      setTodos(prev => prev.map(t => t._id === id ? res.data : t));
    } catch (err) {
      console.error('수정 실패', err);
    }
  };

  const deleteTodo = async (id) => {
    setDeletingId(id);
    setTimeout(async () => {
      try {
        await axios.delete(`${API_URL}/${id}`);
        setTodos(prev => prev.filter(t => t._id !== id));
      } catch (err) {
        console.error('삭제 실패', err);
      } finally {
        setDeletingId(null);
      }
    }, 250);
  };

  const completed = todos.filter(t => t.completed).length;
  const total = todos.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);
  const pending = todos.filter(t => !t.completed);
  const done = todos.filter(t => t.completed);

  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeOut {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(20px); }
        }
        .todo-item { animation: slideIn 0.2s ease; }
        .todo-item.deleting { animation: fadeOut 0.25s ease forwards; }
        .check-btn:hover { transform: scale(1.1); }
        .delete-btn { opacity: 0; transition: opacity 0.15s; }
        .todo-row:hover .delete-btn { opacity: 1; }
        .todo-row:hover { background: #f8f7ff !important; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#f0eff5', // 배경색 (회색)
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}>
        {/* 리스트 바운더리 박스 (카드 디자인) */}
        <div style={{ 
          width: '100%', 
          maxWidth: '480px',
          background: '#ffffff', // 흰색으로 배경 분리
          borderRadius: '24px', // 둥근 모서리
          padding: '40px', // 내부 여백
          boxShadow: '0 20px 40px rgba(0,0,0,0.06)', // 부드러운 그림자 효과
        }}>

          {/* 헤더 */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <p style={{ fontSize: '12px', color: '#aaa', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>
                  MY WORKSPACE
                </p>
                <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#1a1a2e', letterSpacing: '-0.5px' }}>
                  Todo List
                </h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '32px', fontWeight: 700, color: '#1a1a2e', lineHeight: 1 }}>
                  {progress}<span style={{ fontSize: '16px', color: '#aaa' }}>%</span>
                </p>
                <p style={{ fontSize: '12px', color: '#aaa', marginTop: '2px' }}>{completed}/{total} 완료</p>
              </div>
            </div>
            <div style={{ height: '3px', background: '#e0dfe8', borderRadius: '99px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                borderRadius: '99px',
                transition: 'width 0.5s cubic-bezier(.4,0,.2,1)',
              }} />
            </div>
          </div>

          {/* 입력창 */}
          <form onSubmit={addTodo} style={{ marginBottom: '28px', display: 'flex', gap: '10px' }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="새로운 할 일 추가..."
              style={{
                flex: 1,
                background: '#fff',
                border: '1px solid #e0dfe8',
                borderRadius: '12px',
                padding: '13px 16px',
                fontSize: '15px',
                color: '#1a1a2e',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={e => e.target.style.borderColor = '#6366f1'}
              onBlur={e => e.target.style.borderColor = '#e0dfe8'}
            />
            <button
              type="submit"
              disabled={!input.trim() || adding}
              style={{
                background: input.trim() ? 'linear-gradient(135deg, #6366f1, #a855f7)' : '#e8e7f0',
                border: 'none',
                borderRadius: '12px',
                padding: '13px 20px',
                color: input.trim() ? '#fff' : '#bbb',
                fontSize: '15px',
                fontWeight: 600,
                cursor: input.trim() ? 'pointer' : 'default',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {adding ? '...' : '+ 추가'}
            </button>
          </form>

          {/* 할 일 목록 */}
          {pending.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <p style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                할 일 · {pending.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {pending.map(todo => (
                  <div
                    key={todo._id}
                    className={`todo-item todo-row${deletingId === todo._id ? ' deleting' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#fff',
                      border: '1px solid #e8e7f0',
                      borderLeft: '3px solid #6366f1',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      transition: 'background 0.15s',
                    }}
                  >
                    <button
                      className="check-btn"
                      onClick={() => toggleTodo(todo._id, todo.completed)}
                      style={{
                        width: '22px', height: '22px',
                        borderRadius: '50%',
                        border: '2px solid #d0cfe0',
                        background: 'transparent',
                        cursor: 'pointer',
                        flexShrink: 0,
                        transition: 'all 0.15s',
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '15px', color: '#1a1a2e' }}>
                      {todo.title}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTodo(todo._id)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#ccc', fontSize: '18px',
                        cursor: 'pointer', flexShrink: 0,
                        lineHeight: 1, padding: '0 2px',
                      }}
                      onMouseEnter={e => e.target.style.color = '#ef4444'}
                      onMouseLeave={e => e.target.style.color = '#ccc'}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 완료 목록 */}
          {done.length > 0 && (
            <div>
              <p style={{ fontSize: '11px', color: '#aaa', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '10px' }}>
                완료됨 · {done.length}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {done.map(todo => (
                  <div
                    key={todo._id}
                    className={`todo-item todo-row${deletingId === todo._id ? ' deleting' : ''}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      background: '#faf9fc',
                      border: '1px solid #eeedf5',
                      borderLeft: '3px solid #c4c3d0',
                      borderRadius: '12px',
                      padding: '14px 16px',
                      opacity: 0.65,
                      transition: 'background 0.15s',
                    }}
                  >
                    <button
                      className="check-btn"
                      onClick={() => toggleTodo(todo._id, todo.completed)}
                      style={{
                        width: '22px', height: '22px',
                        borderRadius: '50%',
                        border: 'none',
                        background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                        cursor: 'pointer',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s',
                      }}
                    >
                      <span style={{ color: 'white', fontSize: '11px', fontWeight: 700 }}>✓</span>
                    </button>
                    <span style={{ flex: 1, fontSize: '15px', color: '#999', textDecoration: 'line-through' }}>
                      {todo.title}
                    </span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTodo(todo._id)}
                      style={{
                        background: 'none', border: 'none',
                        color: '#ccc', fontSize: '18px',
                        cursor: 'pointer', flexShrink: 0,
                        lineHeight: 1, padding: '0 2px',
                      }}
                      onMouseEnter={e => e.target.style.color = '#ef4444'}
                      onMouseLeave={e => e.target.style.color = '#ccc'}
                    >×</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 빈 상태 */}
          {todos.length === 0 && (
            <div style={{ textAlign: 'center', padding: '48px 0', color: '#ccc' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>✦</div>
              <p style={{ fontSize: '15px' }}>할 일을 추가해보세요</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}

export default App;