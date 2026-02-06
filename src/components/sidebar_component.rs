use crate::icons::{FileIcon, HamburgerIcon, PlusIcon, TrashIcon};
use crate::SETTINGS;
use dioxus::prelude::*;
use rfd::FileDialog;
use serde_json::to_string;
use std::fs::write;
use std::path::Path;
use crate::helpers::settings_path;

#[component]
pub fn SideBarComponent(
    is_collapsed: Signal<bool>,
    on_toggle: EventHandler<MouseEvent>,
) -> Element {
    let sidebar_width = if is_collapsed() { "w-14" } else { "w-64" };
    let settings = SETTINGS.read();
    let recent_files = settings.recent_files.clone();
    let active_file = settings.active_file.clone();

    let handle_import = move |_| {
        let files = FileDialog::new()
            .add_filter("Bash Script", &["sh"])
            .pick_files();

        if let Some(picked_files) = files {
            let mut settings_write = SETTINGS.write();
            let mut changed = false;
            let mut last_path = None;
            for file in picked_files {
                let path_str = file.to_string_lossy().to_string();
                if !settings_write.recent_files.contains(&path_str) {
                    settings_write.recent_files.push(path_str.clone());
                    changed = true;
                }
                last_path = Some(path_str);
            }
            if let Some(path) = last_path {
                settings_write.active_file = Some(path);
                changed = true;
            }
            if changed {
                if let Ok(json) = to_string(&*settings_write) {
                    let _ = write(settings_path(), json);
                }
            }
        }
    };

    let handle_delete = move |path_to_delete: String| {
        let mut settings_write = SETTINGS.write();
        settings_write.recent_files.retain(|p| p != &path_to_delete);
        if settings_write.active_file.as_ref() == Some(&path_to_delete) {
            settings_write.active_file = None;
        }
        if let Ok(json) = to_string(&*settings_write) {
            let _ = write(settings_path(), json);
        } else {
        }
    };

    let handle_select = move |path_to_select: String| {
        let mut settings_write = SETTINGS.write();
        settings_write.active_file = Some(path_to_select);
        if let Ok(json) = to_string(&*settings_write) {
            let _ = write(settings_path(), json);
        }
    };

    rsx! {
        div { class: "h-full rounded-tr-lg rounded-br-lg  bg-(--surface-container) text-(--on-surface) border-r border-(--outline-variant) flex flex-col transition-all duration-300 {sidebar_width}",
            // Header with Hamburger and Optional Title/Import
            div { class: "flex items-center h-16 px-4 flex-shrink-0 border-b border-(--outline-variant) justify-between",
                div { class: "flex items-center",
                    button {
                        class: "cursor-pointer hover:bg-(--surface-container-high) rounded-lg transition-colors flex items-center justify-center p-1",
                        onclick: move |evt| on_toggle.call(evt),
                        HamburgerIcon { class: "w-6 h-6" }
                    }
                    if !is_collapsed() {
                        h2 { class: "ml-3 text-(--primary) text-xs font-bold uppercase tracking-widest truncate",
                            "Scripts"
                        }
                    }
                }

                if !is_collapsed() {
                    button {
                        class: "cursor-pointer p-1.5 hover:bg-(--primary-container) hover:text-(--on-primary-container) rounded-lg transition-all group",
                        title: "Import Script",
                        onclick: handle_import,
                        PlusIcon { class: "w-5 h-5" }
                    }
                }
            }

            // File List
            div { class: "flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-(--outline-variant) scrollbar-track-transparent",
                if is_collapsed() {
                    div { class: "flex flex-col items-center space-y-4",
                        button {
                            class: "cursor-pointer p-2 hover:bg-(--primary-container) hover:text-(--on-primary-container) rounded-lg transition-all",
                            onclick: handle_import,
                            PlusIcon { class: "w-6 h-6" }
                        }
                        for path in recent_files.iter().rev() {
                            {
                                let path_clone = path.clone();
                                let path_for_delete = path.clone();
                                let file_name = Path::new(path)
                                    .file_name()
                                    .unwrap_or_default()
                                    .to_string_lossy();
                                let is_active = Some(path.clone()) == active_file;
                                let active_class = if is_active {
                                    "bg-(--primary-container) text-(--on-primary-container)"
                                } else {
                                    "hover:bg-(--surface-container-highest)"
                                };
                                rsx! {
                                    div {
                                        class: "group relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer {active_class}",
                                        title: "{file_name}",
                                        onclick: move |_| handle_select(path_clone.clone()),
                                        FileIcon { class: "w-6 h-6 text-(--on-surface-variant) group-hover:text-(--primary)" }

                                        button {
                                            class: "cursor-pointer absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10",
                                            onclick: move |evt| {
                                                evt.stop_propagation();
                                                handle_delete(path_for_delete.clone());
                                            },
                                            TrashIcon { class: "w-3 h-3" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } else {
                    // Expanded view: Icon + Name
                    div { class: "px-2 space-y-1",
                        for path in recent_files.iter().rev() {
                            {
                                let path_clone = path.clone();
                                let path_for_delete = path.clone();
                                let file_name = Path::new(path)

                                    .file_name()
                                    .unwrap_or_default()
                                    .to_string_lossy();
                                let is_active = Some(path.clone()) == active_file;
                                let active_class = if is_active {
                                    "bg-(--primary-container) text-(--on-primary-container)"
                                } else {
                                    "hover:bg-(--surface-container-highest)"
                                };
                                rsx! {
                                    div {
                                        class: "w-full flex items-center p-2 rounded-lg transition-colors cursor-pointer group text-left {active_class}",
                                        onclick: move |_| handle_select(path_clone.clone()),
                                        FileIcon { class: "w-5 h-5 mr-3 text-(--on-surface-variant) group-hover:text-(--primary) flex-shrink-0" }
                                        div { class: "flex flex-col truncate flex-1",
                                            span { class: "text-sm font-medium truncate", "{file_name}" }
                                            span { class: "text-[10px] text-(--on-surface-variant) truncate opacity-60",
                                                "{path}"
                                            }
                                        }
                                        button {
                                            class: "opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all",
                                            onclick: move |evt| {
                                                evt.stop_propagation();
                                                handle_delete(path_for_delete.clone());
                                            },
                                            TrashIcon { class: "w-4 h-4" }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}
