use tauri::command;
use tauri_plugin_os::platform;

#[command]
pub fn check_os_info() -> String {
    platform().to_string()
}
