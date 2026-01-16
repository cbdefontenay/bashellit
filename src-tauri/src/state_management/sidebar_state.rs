use std::sync::Mutex;
use tauri::{command, State};

pub struct SidebarState {
    pub is_open: Mutex<bool>,
}

#[command]
pub fn toggle_sidebar(sidebar_state: State<SidebarState>) -> bool {
    let mut is_open = sidebar_state.is_open.lock().unwrap();
    *is_open = !*is_open;
    *is_open
}

#[command]
pub fn get_sidebar_state(sidebar_state: State<SidebarState>) -> bool {
    let is_open = sidebar_state.is_open.lock().unwrap();
    *is_open
}