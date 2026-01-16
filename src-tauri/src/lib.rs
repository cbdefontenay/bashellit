use crate::os_info::check_os_info;
use crate::state_management::{get_sidebar_state, toggle_sidebar, SidebarState};
use std::sync::Mutex;
use tauri::{generate_context, generate_handler};
use tauri_plugin_os::init;
use tauri_plugin_store::Builder;

mod os_info;
mod state_management;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(SidebarState {
            is_open: Mutex::new(true),
        })
        .plugin(init())
        .plugin(Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(generate_handler![
            check_os_info,
            toggle_sidebar,
            get_sidebar_state
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
