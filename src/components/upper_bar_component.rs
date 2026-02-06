use crate::icons::{SettingsIcon, TerminalIcon};
use crate::LAST_ERROR;
use crate::SHOW_SETTINGS;
use dioxus::prelude::*;
use crate::helpers::open_shell_for_active_file;

#[component]
pub fn UpperBarComponent() -> Element {
    rsx! {
        div { class: "h-8 bg-(--surface-container-highest) text-(--on-surface) border-b border-(--outline-variant) flex items-center justify-between px-4 flex-shrink-0",
            div {
                class:"flex flex-row items-center justify-center w-full",
                h1 { class: "font-bold text-(--primary)",
                "bash@bashellit"
            }
            }

            div { class: "flex items-center space-x-1",
                button {
                    class: "cursor-pointer p-2 hover:bg-(--surface-container-high) rounded-lg transition-colors group",
                    title: "Open Shell at Active File",
                    onclick: move |_| {
                        if let Err(e) = open_shell_for_active_file() {
                            *LAST_ERROR.write() = Some(e);
                        }
                    },
                    TerminalIcon { class: "w-6 h-6 text-(--on-surface-variant) group-hover:text-(--primary) transition-colors" }
                }

                button {
                    class: "cursor-pointer p-2 hover:bg-(--surface-container-high) rounded-lg transition-colors group",
                    title: "Settings",
                    onclick: move |_| *SHOW_SETTINGS.write() = true,
                    SettingsIcon { class: "w-6 h-6 text-(--on-surface-variant) group-hover:text-(--primary) transition-colors" }
                }
            }
        }
    }
}
