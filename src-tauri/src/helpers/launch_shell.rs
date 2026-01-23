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

    let terminal_configs = [
        ("xdg-terminal-exec", vec![]),
        ("x-terminal-emulator", vec![]), // Debian/Ubuntu standard
        ("gnome-terminal", vec!["--working-directory"]),
        ("konsole", vec!["--workdir"]),
        ("xfce4-terminal", vec!["--working-directory"]),
        ("mate-terminal", vec!["--working-directory"]),
        ("kitty", vec!["--directory"]),
        ("alacritty", vec!["--working-directory"]),
        ("foot", vec!["--working-directory"]),
        ("tilix", vec!["--working-directory"]),
        ("terminology", vec!["--directory"]),
    ];

    for (term, args) in terminal_configs.iter() {
        let mut command = Command::new(term);
        if !args.is_empty() {
            command.arg(args[0]).arg(dir_path);
        } else {
            command.current_dir(dir_path);
        }

        if command.spawn().is_ok() {
            return Ok(());
        }
    }

    let basic_terminals = ["xterm", "uxterm", "rxvt", "urxvt"];
    for term in basic_terminals.iter() {
        if Command::new(term)
            .current_dir(dir_path)
            .spawn()
            .is_ok()
        {
            return Ok(());
        }
    }

    Err("No terminal emulator found or failed to launch".to_string())
}

