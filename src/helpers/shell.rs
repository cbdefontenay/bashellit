use std::env::consts::OS;
use std::path::Path;
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
    let env_term = std::env::var("TERMINAL").ok();
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
