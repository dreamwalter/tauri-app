import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

interface Todo {
  id: number,
  title: string,
  date: string,
  done: boolean
}

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<Todo>({id:-1, title:"", date:"None", done:false});

  useEffect(()=> {
    fetchAllTodo();
  }, [todos]);

  const fetchAllTodo = async () => {
    setTodos(await invoke("get_todos"));
  }

  const handleTitleChange = (e: React.FormEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value;
    setTodo({...todo, title:value});
  }

  const handleTaskAdd = async () => {
    // setTodos([todo, ...todos]);
    // setTodo('');
  }

  const handleTaskDelete = async (index: any) => {
    // setTodos(todos.filter(e => e !== todos[index]));
    // setTodo('');
  }

  return (
    <div className="container">
      <h1>Welcome to Todo List</h1>
      <div className="row">
        <input
          id="greet-input"
          onChange={(e) => handleTitleChange(e)}
          placeholder="Enter a task..."
          value={todo.title}
        />
        <button type="button" onClick={() => handleTaskAdd()}>
          Add
        </button>
      </div>
      <hr/>
      {todos.map((todo, index) => {
        return (
          <div className="row" key={index}>
            <div style={{padding:'8px'}}>{todo.title}</div>
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
