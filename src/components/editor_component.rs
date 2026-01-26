use crate::components::HighlightedLine;
use crate::icons::SaveIcon;
use crate::SETTINGS;
use dioxus::prelude::*;
use std::fs::{read_to_string, write};

#[component]
pub fn EditorComponent() -> Element {
    let mut editor_content = use_signal(|| "".to_string());
    let mut current_file = use_signal(|| None::<String>);

    let settings = SETTINGS.read();
    let active_file = settings.active_file.clone();

    // Sync editor content with active file
    if active_file != current_file() {
        if let Some(path) = &active_file {
            if let Ok(content) = read_to_string(path) {
                editor_content.set(content);
            }
        } else {
            editor_content.set("".to_string());
        }
        current_file.set(active_file.clone());
    }

    let handle_save = move || {
        if let Some(path) = SETTINGS.read().active_file.clone() {
            let content = editor_content.read().clone();
            if let Ok(_) = write(&path, content) {
                // Saved successfully
            }
        }
    };

    let content_val = editor_content.read();
    let lines: Vec<&str> = content_val.lines().collect();

    let mut display_lines = lines.clone();
    if content_val.ends_with('\n') || content_val.is_empty() {
        display_lines.push("");
    }

    rsx! {
        div {
            class: "h-full flex-1 bg-(--background) text-(--on-background) p-6 flex flex-col overflow-hidden",
            onkeydown: move |evt| {
                if evt.modifiers().contains(Modifiers::CONTROL)
                    && evt.key() == Key::Character("s".into())
                {
                    evt.stop_propagation();
                    handle_save();
                }
            },

            if let Some(path) = active_file {
                div { class: "flex items-center justify-between mb-4",
                    div { class: "flex items-center space-x-2",
                        div { class: "p-1.5 bg-(--primary-container) text-(--on-primary-container) rounded",
                            span { class: "text-[10px] font-bold uppercase", "bash" }
                        }
                        span { class: "text-sm font-medium opacity-80 truncate max-w-md select-all",
                            "{path}"
                        }
                    }

                    button {
                        class: "flex items-center space-x-2 px-3 py-1.5 bg-(--primary) text-(--on-primary) rounded-lg hover:opacity-90 transition-all shadow-sm cursor-pointer group",
                        onclick: move |_| handle_save(),
                        SaveIcon { class: "w-4 h-4 group-hover:scale-110 transition-transform" }
                        span { class: "text-xs font-bold", "Save" }
                    }
                }

                // Professional Editor View with Line Numbers
                div { class: "flex-1 w-full bg-(--surface-container-low) rounded-xl border border-(--outline-variant) shadow-inner flex overflow-hidden",

                    // Main Scrollable Area
                    div { class: "flex-1 overflow-auto scrollbar-thin scrollbar-thumb-(--outline-variant) scrollbar-track-transparent flex",

                        // Line Numbers Column (Sticky)
                        div { class: "sticky left-0 bg-(--surface-container) border-r border-(--outline-variant) py-4 flex flex-col items-end px-3 select-none z-10",
                            for i in 1..=display_lines.len() {
                                div { class: "text-xs font-mono text-(--on-surface-variant) opacity-30 h-[1.625rem] leading-[1.625rem]",
                                    "{i}"
                                }
                            }
                        }

                        // Code Area with Stacked Highlighting and Editing
                        div { class: "relative grid flex-1 min-w-max",
                            // Highlighting Layer (Background)
                            div {
                                class: "col-start-1 row-start-1 p-4 font-mono text-sm whitespace-pre pointer-events-none",
                                style: "line-height: 1.625rem",
                                for line in display_lines {
                                    div { class: "h-[1.625rem] leading-[1.625rem]",
                                        HighlightedLine { line: line.to_string() }
                                    }
                                }
                            }

                            // Editable Layer (Foreground)
                            textarea {
                                class: "col-start-1 row-start-1 w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-(--on-surface) resize-none outline-none border-none whitespace-pre overflow-hidden",
                                style: "line-height: 1.625rem",
                                value: "{editor_content}",
                                oninput: move |e| editor_content.set(e.value()),
                                spellcheck: false,
                                wrap: "off",
                            }
                        }
                    }
                }
            } else {
                div { class: "flex-1 flex flex-col items-center justify-center text-(--on-surface-variant) opacity-40 space-y-4",
                    div { class: "w-24 h-24 rounded-full bg-(--surface-container) flex items-center justify-center",
                        span { class: "text-4xl", "📄" }
                    }
                    p { class: "text-lg font-medium", "No script selected" }
                    p { class: "text-sm", "Import or select a .sh file from the sidebar" }
                }
            }
        }
    }
}
