use std::fs::write;
use crate::{SETTINGS, SHOW_SETTINGS};
use dioxus::prelude::*;
use crate::helpers::settings_path;

#[component]
pub fn SettingsComponent() -> Element {
    let themes = vec![
        ("Light (Default)", "light"),
        ("Dark (Teal)", "dark"),
        ("Kali Linux", "kali"),
        ("Bash Dark", "bash-dark"),
        ("Bash Light", "bash-light"),
    ];

    rsx! {
        // Overlay / Popup container with blueish tint and blur
        div {
            class: "fixed inset-0 z-50 flex items-center justify-center p-4 bg-(--background)/20 backdrop-blur-sm",
            onclick: move |_| *SHOW_SETTINGS.write() = false,

            // Modal content
            div {
                class: "w-full max-w-md bg-(--surface-container-high) rounded-2xl shadow-2xl border border-(--outline-variant) overflow-hidden animate-in fade-in zoom-in duration-200",
                onclick: move |evt| evt.stop_propagation(),

                div { class: "p-6",
                    div { class: "flex items-center justify-between mb-6",
                        h2 { class: "text-xl font-bold text-(--primary)", "Settings" }
                        button {
                            class: "p-2 hover:bg-(--surface-container-highest) rounded-full transition-colors",
                            onclick: move |_| *SHOW_SETTINGS.write() = false,
                            span { class: "w-6 h-6 flex items-center justify-center",
                                "✕"
                            }
                        }
                    }

                    div { class: "space-y-4",
                        div {
                            p { class: "text-xs font-bold text-(--on-surface-variant) mb-3 uppercase tracking-widest",
                                "Theme"
                            }
                            div { class: "grid grid-cols-1 gap-2",
                                for (name , theme_id) in themes {
                                    {
                                        let is_active = SETTINGS.read().theme == theme_id;
                                        let theme_id = theme_id.to_string();
                                        let button_class = if is_active {
                                            "border-(--primary) bg-(--primary-container) text-(--on-primary-container)"
                                        } else {
                                            "border-transparent hover:bg-(--surface-container-highest) text-(--on-surface)"
                                        };
                                        rsx! {
                                            button {
                                                class: "cursor-pointer flex items-center justify-between p-3 rounded-xl border-2 transition-all {button_class}",
                                                onclick: move |_| {
                                                    let mut current_settings = SETTINGS.read().clone();
                                                    current_settings.theme = theme_id.clone();
                                                    *SETTINGS.write() = current_settings.clone();
                                                    if let Ok(json) = serde_json::to_string(&current_settings) {
                                                        let _ = write(settings_path(), json);
                                                    }
                                                },
                                                span { class: "font-medium", "{name}" }
                                                if is_active {
                                                    div { class: "flex items-center text-xs font-bold",
                                                        span { class: "w-2 h-2 rounded-full bg-(--primary) mr-2" }
                                                        "ACTIVE"
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        div {
                            p { class: "text-xs font-bold text-(--on-surface-variant) mb-3 uppercase tracking-widest",
                                "Shortcuts"
                            }
                            div { class: "space-y-2 text-sm text-(--on-surface)",
                                div { class: "flex justify-between",
                                    span { "Save" }
                                    span { class: "font-mono bg-(--surface-container-highest) px-2 py-0.5 rounded",
                                        "Ctrl + S"
                                    }
                                }
                                div { class: "flex justify-between",
                                    span { "Format Bash" }
                                    span { class: "font-mono bg-(--surface-container-highest) px-2 py-0.5 rounded",
                                        "Ctrl + Alt + L"
                                    }
                                }
                            }
                        }
                    }
                }

                div { class: "p-4 bg-(--surface-container-highest) flex justify-end border-t border-(--outline-variant)",
                    button {
                        class: "cursor-pointer px-6 py-2 bg-(--primary) text-(--on-primary) rounded-lg font-bold hover:opacity-90 transition-opacity",
                        onclick: move |_| *SHOW_SETTINGS.write() = false,
                        "Close"
                    }
                }
            }
        }
    }
}
