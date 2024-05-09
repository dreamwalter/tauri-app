import { useState } from "react";
// import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

function App() {
  const [todos, setTodos] = useState<string[]>([]);
  const [todo, setTodo] = useState("");

  const handleTaskAdd = async () => {
    setTodos([todo, ...todos]);
    setTodo('');
  }

  const handleTaskDelete = async (index: any) => {
    setTodos(todos.filter(e => e !== todos[index]));
    setTodo('');
  }

  return (
    <div className="container">
      <h1>Welcome to Todo List</h1>
      <div className="row">
        <input
          id="greet-input"
          onChange={(e) => setTodo(e.currentTarget.value)}
          placeholder="Enter a task..."
          value={todo}
        />
        <button type="button" onClick={() => handleTaskAdd()}>
          Add
        </button>
      </div>
      <hr/>
      {todos.map((todo, index) => {
        return (
          <div className="row" key={index}>
            <div style={{padding:'8px'}}>{todo}</div>
            <button type="button" onClick={() => handleTaskDelete(index)}>
              Delete
            </button>
          </div>
        )
      })}
    </div>
  );
}

export default App;
