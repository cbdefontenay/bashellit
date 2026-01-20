use std::fs::{read_to_string, write};
use std::path::Path;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::{command, AppHandle, Manager};
use tauri::async_runtime::spawn_blocking;
use tauri_plugin_dialog::DialogExt;
use tauri_plugin_store::StoreBuilder;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BashFile {
    pub name: String,
    pub path: String,
    pub content: String,
}

#[command]
pub async fn pick_bash_file(app: AppHandle) -> Result<BashFile, String> {
    let result = spawn_blocking(move || {
        app.dialog()
            .file()
            .add_filter("Bash Script", &["sh"])
            .blocking_pick_file()
    })
        .await
        .map_err(|e| format!("Failed to spawn blocking task: {}", e))?;

    match result {
        Some(file_path) => {
            let path_string = file_path.to_string();

            // Extract filename from path
            let name = Path::new(&path_string)
                .file_name()
                .map(|n| n.to_string_lossy().to_string())
                .unwrap_or_else(|| "unnamed.sh".to_string());

            let content =
                read_to_string(&path_string).map_err(|e| format!("Failed to read file: {}", e))?;

            let file = BashFile {
                name,
                path: path_string,
                content,
            };

            Ok(file)
        }
        None => Err("No file selected".to_string()),
    }
}

#[command]
pub async fn save_file(path: String, content: String) -> Result<(), String> {
    write(path, content).map_err(|e| format!("Failed to save file: {}", e))
}

#[command]
pub async fn read_file(path: String) -> Result<String, String> {
    read_to_string(path).map_err(|e| format!("Failed to read file: {}", e))
}

#[command]
pub async fn get_recent_files(app: AppHandle) -> Result<Vec<BashFile>, String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("recent-files.json");

    let store = StoreBuilder::new(&app, store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    match store.get("files") {
        Some(Value::Array(files)) => {
            let mut recent_files = Vec::new();
            for file_val in files {
                if let Ok(file) = serde_json::from_value::<BashFile>(file_val.clone()) {
                    recent_files.push(file);
                }
            }
            Ok(recent_files)
        }
        _ => Ok(Vec::new()),
    }
}

#[command]
pub async fn add_recent_file(app: AppHandle, file: BashFile) -> Result<(), String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("recent-files.json");

    let store = StoreBuilder::new(&app, store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    let mut files = match store.get("files") {
        Some(Value::Array(f)) => f.clone(),
        _ => Vec::new(),
    };

    // Remove if already exists (to move to top)
    files.retain(|f| {
        if let Ok(existing_file) = serde_json::from_value::<BashFile>(f.clone()) {
            existing_file.path != file.path
        } else {
            true
        }
    });

    files.insert(0, serde_json::to_value(&file).map_err(|e| e.to_string())?);

    // Limit to 20 files
    if files.len() > 20 {
        files.truncate(20);
    }

    store.set("files", Value::Array(files));
    store.save().map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}

#[command]
pub async fn remove_recent_file(app: AppHandle, path: String) -> Result<(), String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("recent-files.json");

    let store = StoreBuilder::new(&app, store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    let mut files = match store.get("files") {
        Some(Value::Array(f)) => f.clone(),
        _ => Vec::new(),
    };

    files.retain(|f| {
        if let Ok(existing_file) = serde_json::from_value::<BashFile>(f.clone()) {
            existing_file.path != path
        } else {
            true
        }
    });

    store.set("files", Value::Array(files));
    store.save().map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}