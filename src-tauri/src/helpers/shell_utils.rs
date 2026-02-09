use std::env::consts::OS;
use std::env::var;
use std::path::Path;
use std::process::{Command, Stdio};

#[tauri::command]
pub fn open_shell_in_dir(dir: String) -> Result<(), String> {
    if OS != "linux" {
        return Err("Linux only".to_string());
    }

    let path = Path::new(&dir);
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
            .current_dir(path)
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
