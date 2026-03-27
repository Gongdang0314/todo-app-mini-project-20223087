import { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [todos, setTodos] = useState([]);
  const [input, setInput] = useState('');

  // 백엔드 API 주소 (로컬 테스트용)
  const API_URL = 'http://localhost:5000/api/todos';

  // 1. Todo 목록 불러오기 (GET)
  const fetchTodos = async () => {
    try {
      const res = await axios.get(API_URL);
      setTodos(res.data);
    } catch (err) {
      console.error("데이터를 가져오는데 실패했습니다.", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  // 2. Todo 추가하기 (POST)
  const addTodo = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const res = await axios.post(API_URL, { title: input });
      setTodos([...todos, res.data]);
      setInput(''); // 입력창 초기화
    } catch (err) {
      console.error("추가 실패", err);
    }
  };

  // 3. Todo 완료 체크 (PUT)
  const toggleTodo = async (id, completed) => {
    try {
      const res = await axios.put(`${API_URL}/${id}`, { completed: !completed });
      setTodos(todos.map(todo => (todo._id === id ? res.data : todo)));
    } catch (err) {
      console.error("수정 실패", err);
    }
  };

  // 4. Todo 삭제 (DELETE)
  const deleteTodo = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      setTodos(todos.filter(todo => todo._id !== id));
    } catch (err) {
      console.error("삭제 실패", err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-blue-600">My Todo List</h1>
        
        {/* 입력 폼 */}
        <form onSubmit={addTodo} className="flex gap-2 mb-6">
          <input
            type="text"
            className="flex-1 border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="할 일을 입력하세요"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition">
            추가
          </button>
        </form>

        {/* 목록 출력 */}
        <ul className="space-y-3">
          {todos.map((todo) => (
            <li key={todo._id} className="flex items-center justify-between bg-gray-50 p-3 rounded border border-gray-200">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo._id, todo.completed)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span className={`${todo.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo._id)}
                className="text-red-500 hover:text-red-700 text-sm font-semibold"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
        
        {todos.length === 0 && (
          <p className="text-center text-gray-500 mt-4">할 일이 없습니다. 추가해 보세요!</p>
        )}
      </div>
    </div>
  );
}

export default App;