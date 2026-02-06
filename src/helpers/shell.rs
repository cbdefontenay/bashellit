use std::env::consts::OS;
use std::env::{var, var_os};
use std::fs::create_dir_all;
use std::path::{Path, PathBuf};
use std::process::{Command, Stdio};

use crate::SETTINGS;
use dioxus::prelude::*;

/// Opens a terminal emulator at the directory of the current active file.
/// On Linux, tries several common terminal emulators. On other platforms,
/// returns an error. Non-blocking; spawns and returns immediately.
pub fn open_shell_for_active_file() -> Result<(), String> {
    let active = SETTINGS.read().active_file.clone();
    let Some(active_path) = active else {
        return Err("No active file selected".to_string());
    };

    let dir = Path::new(&active_path)
        .parent()
        .map(|p| p.to_path_buf())
        .ok_or_else(|| "Could not determine the directory of the active file".to_string())?;

    open_shell_in_dir(&dir)
}

/// Search for the OS of the user and tries different shells.
fn open_shell_in_dir(dir: &Path) -> Result<(), String> {
    if OS != "linux" {
        return Err("Linux only".to_string());
    }

    let mut candidates = vec![
        "x-terminal-emulator",
        "xdg-terminal-exec",
        "gnome-terminal",
        "konsole",
        "xfce4-terminal",
        "kitty",
        "alacritty",
    ];

    // If the user has a preferred terminal env var, put it at the start
    let env_term = var("TERMINAL").ok();
    if let Some(ref t) = env_term {
        candidates.insert(0, t.as_str());
    }

    for bin in candidates {
        if Command::new(bin)
            .current_dir(dir)
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .is_ok()
        {
            return Ok(());
        }
    }

    Err("Could not find a terminal. Try setting the $TERMINAL environment variable.".to_string())
}

/// Returns a writable, persistent config path for the app
pub fn settings_path() -> PathBuf {
    // dirs-next correctly handles:
    // - XDG_CONFIG_HOME
    // - ~/.config fallback
    // - weird HOME setups
    let base = dirs_next::config_dir()
        .unwrap_or_else(|| PathBuf::from("/tmp"));

    let app_dir = base.join("bash-editor");

    let _ = create_dir_all(&app_dir);

    app_dir.join("settings.json")
}
