use crate::icons::SettingsIcon;
use crate::SHOW_SETTINGS;
use dioxus::prelude::*;

#[component]
pub fn UpperBarComponent() -> Element {
    rsx! {
        div { class: "h-6 bg-(--surface-container-highest) text-(--on-surface) border-b border-(--outline-variant) flex items-center justify-between px-4 flex-shrink-0",
            h1 { class: "font-bold text-(--primary)", "Bashellit" }

            button {
                class: "cursor-pointer p-2 hover:bg-(--surface-container-high) rounded-lg transition-colors group",
                title: "Settings",
                onclick: move |_| *SHOW_SETTINGS.write() = true,
                SettingsIcon { class: "w-4 h-4 text-(--on-surface-variant) group-hover:text-(--primary) transition-colors" }
            }
        }
    }
}
