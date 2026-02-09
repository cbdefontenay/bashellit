mod helpers;

use tauri::{generate_context, generate_handler, Builder};
use helpers::bash_utils::{format_bash, highlight_bash};
use helpers::file_manager::{read_file, save_file};
use helpers::shell_utils::open_shell_in_dir;
use helpers::state_manager::{get_dirty_state, set_dirty_state, FileState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    Builder::default()
        .manage(FileState::new())
        .plugin(tauri_plugin_store::Builder::new().build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(generate_handler![
            open_shell_in_dir,
            format_bash,
            highlight_bash,
            read_file,
            save_file,
            set_dirty_state,
            get_dirty_state
        ])
        .run(generate_context!())
        .expect("Error while running tauri application");
}
