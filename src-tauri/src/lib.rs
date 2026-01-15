use crate::os_info::check_os_info;
use tauri::{generate_context, generate_handler};
use tauri_plugin_os::init;
use tauri_plugin_store::Builder;

mod os_info;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(init())
        .plugin(Builder::new().build())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(generate_handler![check_os_info])
        .run(generate_context!())
        .expect("error while running tauri application");
}
