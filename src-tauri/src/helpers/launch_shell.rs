use std::env::var;
use tauri::{command, AppHandle};
use std::path::Path;
use std::process::Command;

#[command]
pub fn launch_shell(_app: AppHandle, file_path: String) -> Result<(), String> {
    let path = Path::new(&file_path);
    let dir_path = path.parent()
        .ok_or_else(|| "Invalid file path: no parent directory".to_string())?
        .to_str()
        .ok_or_else(|| "Invalid path encoding".to_string())?;

    // Try to use dbus to open a terminal
    let dbus_result = Command::new("dbus-send")
        .args(&[
            "--session",
            "--dest=org.freedesktop.FileManager1",
            "--type=method_call",
            "/org/freedesktop/FileManager1",
            "org.freedesktop.FileManager1.ShowFolders",
            format!("array:string:\"file://{}\"", dir_path).as_str(),
            "string:\"\""
        ])
        .spawn();

    if dbus_result.is_ok() {
        return Ok(());
    }

    // Fallback: try to detect desktop environment and use appropriate method
    let desktop_env = var("XDG_CURRENT_DESKTOP").unwrap_or_default();

    match desktop_env.as_str() {
        "GNOME" | "Unity" => {
            Command::new("gnome-terminal")
                .arg("--working-directory")
                .arg(dir_path)
                .spawn()
                .map_err(|e| format!("Failed to launch GNOME terminal: {}", e))?;
        },
        "KDE" => {
            Command::new("konsole")
                .arg("--workdir")
                .arg(dir_path)
                .spawn()
                .map_err(|e| format!("Failed to launch Konsole: {}", e))?;
        },
        "XFCE" => {
            Command::new("xfce4-terminal")
                .arg("--working-directory")
                .arg(dir_path)
                .spawn()
                .map_err(|e| format!("Failed to launch XFCE terminal: {}", e))?;
        },
        _ => {
            let terminals = ["x-terminal-emulator", "xterm", "rxvt", "urxvt"];
            for term in terminals.iter() {
                if Command::new(term)
                    .arg("-e")
                    .arg("bash")
                    .arg("-c")
                    .arg(&format!("cd '{}'; exec bash", dir_path))
                    .spawn()
                    .is_ok()
                {
                    return Ok(());
                }
            }
            return Err("No terminal emulator found".to_string());
        }
    }

    Ok(())
}