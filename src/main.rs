mod components;
mod icons;
mod helpers;

use std::fs::read_to_string;
use std::time;
use time::Duration;
use crate::components::{EditorComponent, LoaderComponent, SettingsComponent, SideBarComponent, UpperBarComponent};
use dioxus::desktop::{window, Config, WindowBuilder};
use dioxus::prelude::*;
use serde::{Deserialize, Serialize};
use serde_json;
use serde_json::from_str;
use tokio::time::sleep;

const FAVICON: Asset = asset!("/assets/favicon.ico");
const MAIN_CSS: Asset = asset!("/assets/main.css");
const TAILWIND_CSS: Asset = asset!("/assets/tailwind.css");

#[derive(Serialize, Deserialize, Clone)]
pub struct AppSettings {
    pub theme: String,
    pub recent_files: Vec<String>,
    pub active_file: Option<String>,
}

impl Default for AppSettings {
    fn default() -> Self {
        Self {
            theme: "light".to_string(),
            recent_files: Vec::new(),
            active_file: None,
        }
    }
}

pub static SETTINGS: GlobalSignal<AppSettings> = Signal::global(|| {
    let content = read_to_string("settings.json").unwrap_or_default();
    from_str(&content).unwrap_or_default()
});

pub static SHOW_SETTINGS: GlobalSignal<bool> = Signal::global(|| false);
pub static LAST_ERROR: GlobalSignal<Option<String>> = Signal::global(|| None);

fn main() {
    let window = WindowBuilder::new()
        .with_title("Bashellit")
        .with_visible(false)
        // .with_inner_size(LogicalSize::new(4000, 2000))
        .with_resizable(true)
        .with_always_on_top(false)
        .with_focused(true)
        .with_decorations(true);

    LaunchBuilder::new()
        .with_cfg(Config::new().with_window(window).with_menu(None))
        .launch(App);
}

#[component]
fn App() -> Element {
    // This use_effect is used for preventing the app to launch first without any styling.
    use_effect(move || {
        window().set_visible(true);
    });

    rsx! {
        document::Link { rel: "icon", href: FAVICON }
        Stylesheet { href: MAIN_CSS }
        Stylesheet { href: TAILWIND_CSS }

        Bashellit {}
    }
}

#[component]
fn Bashellit() -> Element {
    let mut is_collapsed = use_signal(|| false);
    let mut is_loading = use_signal(|| true);

    let _ = use_resource(move || async move {
        sleep(Duration::from_millis(2000)).await;
        is_loading.set(false);
    });

    let theme = SETTINGS.read().theme.clone();
    let theme_class = if theme == "light" { "" } else { theme.as_str() };

    rsx! {
        main { class: "h-screen flex flex-col {theme_class} relative bg-(--surface-container)",
            if is_loading() {
                LoaderComponent {}
            }

            UpperBarComponent {}

            div { class: "flex flex-1 overflow-hidden",
                SideBarComponent {
                    is_collapsed,
                    on_toggle: move |_| is_collapsed.toggle(),
                }
                EditorComponent {}
            }

            if *SHOW_SETTINGS.read() {
                SettingsComponent {}
            }

            // Error toast/banner
            if let Some(msg) = LAST_ERROR.read().clone() {
                div { class: "absolute bottom-4 right-4 bg-(--primary-container) text-(--on-primary-container) px-4 py-3 rounded-lg shadow-lg max-w-md flex items-start space-x-3 border border-(--outline-variant)",
                    div { class: "text-sm whitespace-pre-wrap break-words", "{msg}" }
                    button {
                        class: "ml-3 text-xs font-bold opacity-80 hover:opacity-100 underline",
                        onclick: move |_| *LAST_ERROR.write() = None,
                        "Dismiss"
                    }
                }
            }
        }
    }
}
