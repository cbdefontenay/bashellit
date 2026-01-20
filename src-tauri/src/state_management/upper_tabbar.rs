use std::sync::Mutex;
use tauri::{command, State};

pub struct UpperTabBarState {
    pub active_tab: Mutex<String>,
}

#[command]
pub fn get_active_tab(state: State<UpperTabBarState>) -> String {
    let active_tab = state.active_tab.lock().unwrap();
    active_tab.clone()
}

#[command]
pub fn set_active_tab(state: State<UpperTabBarState>, tab: String) -> Result<String, String> {
    let valid_tabs = vec!["files", "settings"];

    if !valid_tabs.contains(&tab.as_str()) {
        return Err(format!(
            "Invalid tab: {}. Available tabs: files, settings",
            tab
        ));
    }

    let mut active_tab = state.active_tab.lock().unwrap();
    *active_tab = tab.clone();

    Ok(tab)
}

#[command]
pub fn toggle_active_tab(state: State<UpperTabBarState>) -> String {
    let mut active_tab = state.active_tab.lock().unwrap();

    if *active_tab == "files" {
        *active_tab = "settings".to_string();
    } else {
        *active_tab = "files".to_string();
    }

    active_tab.clone()
}