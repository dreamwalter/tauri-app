import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { message, confirm, ask } from '@tauri-apps/api/dialog';
import { sendNotification } from "@tauri-apps/api/notification";
import { writeTextFile, BaseDirectory } from '@tauri-apps/api/fs';
import "./App.css";

interface Todo {
  id: number,
  title: string,
  date: string,
  done: boolean
}

const buttons = [
  {
    value: 10, display: "10s",
  },
  {
    value: 1800, display: "30m",
  }
];

function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todo, setTodo] = useState<Todo>({id:-1, title:"", date:"None", done:false});
  // Timer
  const [time, setTime] = useState(0);
  const [timerStart, setTimerStart] = useState(false);

  useEffect(()=> {
    fetchAllTodo();
  }, [todos]);
  // Pomodoro
  useEffect(()=> {
    const handleInterval = setInterval(() => {
      if (timerStart) {
        if (time > 0) {
          setTime(time - 1);
        } else {
          sendNotification({
            title: `Time up!!`,
            body: `Done Pomodoro`,
          });
          clearInterval(handleInterval);
        }
      }
    }, 1000);
    return () => clearInterval(handleInterval);
  }, [timerStart, time]);

  const fetchAllTodo = async () => {
    setTodos(await invoke("get_todos"));
  }

  const toggleTimer = () => {
    setTimerStart(!timerStart);
  }

  const triggerResetDialog = async () => {
    let shouldReset = await ask("Reset?", {
      title: "Pomodoro Timer",
      type: "warning",
    })
    if (shouldReset) {
      setTime(900);
      setTimerStart(false);
    }
  }

  const handleTitleChange = (e: React.FormEvent<HTMLInputElement>) => {
    let value = e.currentTarget.value;
    setTodo({...todo, title:value});
  }

  const handleTaskAdd = async () => {
    await invoke("new_todo", {title: todo.title, date: Date.now.toString()});
    setTodo({...todo, title:""});
  }

  const handleTaskDelete = async (id: number) => {
    const confirmed = await confirm('This action cannot be reverted. Are you sure?', {title: 'Tauri', type: 'warning'});
    if (confirmed) 
      await invoke("delete_todo", {id: id});
    setTodo({...todo, title:""});
  }

  const handleChecked = async (index: number) => {
    await invoke("done_todo",{id: todos[index].id})
    if (!todos[index].done) {
      await message("Done", {title: 'Todo'});
      sendNotification({
        title: `Todo is done`,
        body: `Great, you did it!!!!!!!!!`,
      });
    }
  }

  const handleExportFile = async () => {
    const separator = ',';
    const keys = Object.keys(todos[0]);
    const csvContent =
      keys.join(separator) +
      '\n' +
      todos.map(row => {
        return keys.map(k => {
          let cell = row[k] === null || row[k] === undefined ? '' : row[k];
          cell = cell instanceof Date
            ? cell.toLocaleString()
            : cell.toString().replace(/"/g, '""');
          if (cell.search(/("|,|\n)/g) >= 0) {
            cell = `"${cell}"`;
          }
          return cell;
        }).join(separator);
      }).join('\n');
    console.log(csvContent);
  }

  return (
    <div className="container">
      <h1>
        {`${
            Math.floor(time / 60) < 10
              ? `0${Math.floor(time / 60)}`
              : `${Math.floor(time / 60)}`
          }:${time % 60 < 10 ? `0${time % 60}` : time % 60}`
        }
      </h1>
      <div className="row" style={{margin: 10}}>
        <button onClick={toggleTimer}>
          {!timerStart ? "Start" : "Pause"}
        </button>
        <button onClick={triggerResetDialog}>
          Reset Timer
        </button>
      </div>
      <div>
        {buttons.map(({value, display}) => (
          <button type="button" onClick={() => {
            setTimerStart(false);
            setTime(value);
          }}>
            {display}
          </button>
        ))}
      </div>
      <br/>

      <h1>Todo List</h1>
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
            <div style={{padding:'8px'}}></div>
            <span 
              onClick={() => handleChecked(index)}
              style={{
                textDecoration: todos[index].done ? 'line-through' : ''
              }}
            >
              {todo.title}
            </span>
            <button type="button" onClick={() => handleTaskDelete(todo.id)}>
              Delete
            </button>
          </div>
        )
      })}

      {/* export */}
      <hr/>

      <div>
        <button type="button" onClick={() => handleExportFile()}>
          Export
        </button>
      </div>

    </div>
  );
}

export default App;
