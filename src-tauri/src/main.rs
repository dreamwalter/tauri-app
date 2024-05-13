#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

mod todo;
use todo::{Todo, TodoApp};

use std::sync::Mutex;
use tauri::{CustomMenuItem, Menu, MenuItem, Submenu, Manager};

struct AppState {
    app: Mutex<TodoApp>,
}

fn main() {
    let _app = TodoApp::new().unwrap();
    // here `"quit".to_string()` defines the menu item id, and the second parameter is the menu item label.
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    let close = CustomMenuItem::new("close".to_string(), "Close");
    let submenu = Submenu::new("File", Menu::new().add_item(quit).add_item(close));
    let menu = Menu::new()
      .add_native_item(MenuItem::Copy)
      .add_item(CustomMenuItem::new("hide", "Hide"))
      .add_submenu(submenu);

    tauri::Builder::default()
      .setup(|app| {
        let splashscreen_window = app.get_window("splashscreen").unwrap();
        let main_window = app.get_window("main").unwrap();
        // we perform the initialization code on a new task so the app doesn't freeze
        tauri::async_runtime::spawn(async move {
          // initialize your app here instead of sleeping :)
          println!("Initializing...");
          std::thread::sleep(std::time::Duration::from_secs(2));
          println!("Done initializing.");
  
          // After it's done, close the splashscreen and display the main window
          splashscreen_window.close().unwrap();
          main_window.show().unwrap();
        });
        Ok(())
      })
      .menu(menu)
      .on_menu_event(|event| match event.menu_item_id() {
        "quit" => {
          // Custom
          std::process::exit(0);
        }
        "close" => {
          // Custom
          event.window().close().unwrap();
        }
        _ => {}
      })
      .invoke_handler(tauri::generate_handler![
        get_todos, new_todo, done_todo, delete_todo
      ])
      .manage(AppState {
        app: Mutex::from(_app),
      })
      .run(tauri::generate_context!())
      .expect("failed to run app");
}

#[tauri::command]
fn get_todos(state: tauri::State<AppState>) -> Vec<Todo> {
    let app = state.app.lock().unwrap();
    let todos = app.get_todos().unwrap();
    todos
}

#[tauri::command]
fn new_todo(title: String, date: String) -> bool {
    let app = TodoApp::new().unwrap();
    let result = app.new_todo(title, date);
    app.conn.close().unwrap();
    result
}

#[tauri::command]
fn done_todo(id: i32) -> bool {
    let app = TodoApp::new().unwrap();
    let result = app.done_todo(id);
    app.conn.close().unwrap();
    result
}

#[tauri::command]
fn delete_todo(id: i32) -> bool {
    let app = TodoApp::new().unwrap();
    let result = app.delete_todo(id);
    app.conn.close().unwrap();
    result
}

// #[tauri::command]
// fn greet(name: &str) -> String {
//     format!("Hello, {}! You've been greeted from Rust!", name)
// }

// fn main() {
//     tauri::Builder::default()
//         .invoke_handler(tauri::generate_handler![greet])
//         .run(tauri::generate_context!())
//         .expect("error while running tauri application");
// }
