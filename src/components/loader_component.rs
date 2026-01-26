use dioxus::prelude::*;
use crate::icons::LoaderIcon;

#[component]
pub fn LoaderComponent() -> Element {
    rsx! {
        div { class: "fixed inset-0 z-[100] flex flex-col items-center justify-center bg-(--background) transition-all duration-500",
            div { class: "relative",
                div { class: "absolute inset-0 bg-(--primary) opacity-20 blur-3xl rounded-full animate-pulse" }
                div { class: "relative flex flex-col items-center",
                    LoaderIcon { class: "w-16 h-16 text-(--primary)" }
                    div { class: "absolute inset-0 flex items-center justify-center pt-0",
                        span { class: "text-xl font-black text-(--primary) opacity-80",
                            "B"
                        }
                    }
                }
            }

            div { class: "mt-8 flex flex-col items-center space-y-2",
                h1 { class: "text-2xl font-bold tracking-[0.2em] text-(--primary) uppercase",
                    "Bashellit"
                }

                // Animated loading dots
                div { class: "flex items-center space-x-1",
                    span { class: "text-sm text-(--on-surface-variant) opacity-60 font-medium",
                        "Initializing workspace"
                    }
                    div { class: "flex space-x-1 pt-1",
                        span { class: "w-1 h-1 bg-(--primary) rounded-full animate-bounce [animation-delay:-0.3s]" }
                        span { class: "w-1 h-1 bg-(--primary) rounded-full animate-bounce [animation-delay:-0.15s]" }
                        span { class: "w-1 h-1 bg-(--primary) rounded-full animate-bounce" }
                    }
                }
            }
        }
    }
}
