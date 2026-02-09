use std::sync::Mutex;
use tauri::State;

pub struct FileState {
    pub is_dirty: Mutex<bool>,
}

impl FileState {
    pub fn new() -> Self {
        Self {
            is_dirty: Mutex::new(false),
        }
    }
}

#[tauri::command]
pub fn set_dirty_state(state: State<'_, FileState>, is_dirty: bool) {
    let mut dirty = state.is_dirty.lock().unwrap();
    *dirty = is_dirty;
}

#[tauri::command]
pub fn get_dirty_state(state: State<'_, FileState>) -> bool {
    *state.is_dirty.lock().unwrap()
}
