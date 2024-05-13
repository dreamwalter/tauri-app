use rusqlite::{Connection, Result};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct Todo {
  pub id: i32,
  pub title: String,
  pub date: String,
  pub done: bool,
}

pub struct TodoApp {
  pub conn: Connection,
}

impl TodoApp {
  pub fn new()->Result<TodoApp> {
    let db_path = "db.sqlite";
    let conn = Connection::open(db_path)?;
    conn.execute(
      "CREATE TABLE IF NOT EXISTS Todo (
        id          INTEGER PRIMARY KEY   AUTOINCREMENT,
        title       text            NOT NULL,
        date        text            NOT NULL,
        done        numeric         DEFAULT 0
    )",
      [],
    )?;
    Ok(TodoApp {conn})
  }

  pub fn get_todos(&self) -> Result<Vec<Todo>> {
    let mut stmt = self.conn.prepare("SELECT * FROM Todo").unwrap();
    let todos_iter = stmt.query_map([], |row| {
      let done = row.get::<usize, i32>(3).unwrap() == 1;

      Ok(Todo {
        id: row.get(0)?,
        title: row.get(1)?,
        date: row.get(2)?,
        done,
      })
    })?;
    let mut todos: Vec<Todo> = Vec::new();

    for todo in todos_iter {
      todos.push(todo?);
    }

    Ok(todos)
  }

  pub fn new_todo(&self, title: String, date: String) -> bool {
    match self
      .conn
      .execute("INSERT INTO Todo (title, date) VALUES (?, ?)", [title, date])
      {
        Ok(insert) => {
          println!("{} inserted", insert);
          true
        }
        Err(err) => {
          println!("Insert Error: {}", err);
          false
        }
      }
  }

  pub fn done_todo(&self, id: i32) -> bool {
    match self
      .conn
      .execute("UPDATE Todo SET done=1 WHERE id=$1", [id])
      {
        Ok(done) => {
          println!("{} done", done);
          true
        }
        Err(err) => {
          println!("Done Error: {}", err);
          false
        }
      }
  }

  pub fn delete_todo(&self, id: i32) -> bool {
    match self
    .conn
    .execute("DELETE FROM Todo WHERE id=$1", [id])
    {
      Ok(delete) => {
        println!("{} deleted", delete);
        true
      }
      Err(err) => {
        println!("Delete Error: {}", err);
        false
      }
    }
  }
}