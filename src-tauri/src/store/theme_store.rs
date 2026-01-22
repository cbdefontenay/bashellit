use serde_json::Value;
use tauri::{command, AppHandle, Manager};
use tauri_plugin_store::StoreBuilder;

#[command]
pub async fn store_and_set_theme(app: AppHandle, app_theme: String) -> Result<String, String> {
    let valid_themes = vec!["light", "dark", "kali", "bash-light", "bash-dark"];

    if !valid_themes.contains(&app_theme.as_str()) {
        return Err(format!(
            "Invalid theme: {}. Available themes: light, dark, kali, bash-light, bash-dark",
            app_theme
        ));
    }

    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("theme-config.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    store.set("app-theme", Value::String(app_theme.clone()));

    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(app_theme)
}

#[command]
pub async fn store_and_get_theme(app: AppHandle) -> Result<String, String> {
    let store_path = app
        .path()
        .app_config_dir()
        .map_err(|e| format!("Failed to get config dir: {}", e))?
        .join("theme-config.json");

    let store = StoreBuilder::new(&app.clone(), store_path)
        .build()
        .map_err(|e| format!("Failed to build store: {}", e))?;

    match store.get("app-theme") {
        Some(Value::String(theme)) => Ok(theme.clone()),
        _ => Ok("light".to_string()), // Default theme
    }
}
