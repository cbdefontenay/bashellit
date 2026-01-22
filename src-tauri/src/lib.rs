use crate::helpers::{
    add_recent_file, add_recent_files, get_recent_files, launch_shell, pick_bash_files, read_file,
    remove_recent_file, save_file,
};
use crate::os_info::check_os_info;
use crate::state_management::{get_sidebar_state, show_settings, toggle_sidebar, SidebarState};
use crate::store::{store_and_get_theme, store_and_set_theme};
use std::sync::Mutex;
use tauri::{generate_context, generate_handler};
use tauri_plugin_os::init;
use tauri_plugin_store::Builder;

mod helpers;
mod os_info;
mod state_management;
mod store;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_upload::init())
        .plugin(tauri_plugin_store::Builder::new().build())
        .manage(SidebarState {
            is_open: Mutex::new(true),
            is_settings_open: Mutex::new(false),
        })
        .plugin(init())
        .plugin(Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(generate_handler![
            check_os_info,
            toggle_sidebar,
            get_sidebar_state,
            show_settings,
            store_and_set_theme,
            store_and_get_theme,
            pick_bash_files,
            save_file,
            read_file,
            get_recent_files,
            add_recent_files,
            add_recent_file,
            remove_recent_file,
            launch_shell
        ])
        .run(generate_context!())
        .expect("error while running tauri application");
}
