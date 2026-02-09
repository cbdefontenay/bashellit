import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { load } from "@tauri-apps/plugin-store";
import "./App.css";
import Loader from "./components/Loader";
import UpperBar from "./components/UpperBar";
import SideBar from "./components/SideBar";
import Editor from "./components/Editor";
import Settings from "./components/Settings";

function App() {
    const [settings, setSettings] = useState({
        theme: "light",
        recent_files: [],
        active_file: null,
    });
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [showSettings, setShowSettings] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const initStore = async () => {
            try {
                const store = await load("settings.json", { autoSave: true });
                const savedSettings = await store.get("settings");
                if (savedSettings) {
                    setSettings(savedSettings);
                }
                // Simulate loading like in bashellit
                setTimeout(() => setIsLoading(false), 2000);
            } catch (err) {
                console.error("Failed to load store:", err);
                setIsLoading(false);
            }
        };
        initStore();
    }, []);

    const saveSettings = async (newSettings) => {
        setSettings(newSettings);
        try {
            const store = await load("settings.json", { autoSave: true });
            await store.set("settings", newSettings);
        } catch (err) {
            console.error("Failed to save settings:", err);
        }
    };

    const themeClass = settings.theme === "light" ? "" : settings.theme;

    return (
        <main className={`h-screen flex flex-col ${themeClass} relative bg-(--surface-container)`}>
            {isLoading && <Loader />}

            <UpperBar
                onOpenSettings={() => setShowSettings(true)}
                activeFile={settings.active_file}
                onError={setError}
            />

            <div className="flex flex-1 overflow-hidden">
                <SideBar
                    isCollapsed={isCollapsed}
                    onToggle={() => setIsCollapsed(!isCollapsed)}
                    settings={settings}
                    onSettingsChange={saveSettings}
                />
                <Editor
                    activeFile={settings.active_file}
                    onError={setError}
                />
            </div>

            {showSettings && (
                <Settings
                    settings={settings}
                    onSettingsChange={saveSettings}
                    onClose={() => setShowSettings(false)}
                />
            )}

            {error && (
                <div className="absolute bottom-4 right-4 bg-(--primary-container) text-(--on-primary-container) px-4 py-3 rounded-lg shadow-lg max-w-md flex items-start space-x-3 border border-(--outline-variant) z-50">
                    <div className="text-sm whitespace-pre-wrap break-words">{error}</div>
                    <button
                        className="ml-3 text-xs font-bold opacity-80 hover:opacity-100 underline cursor-pointer"
                        onClick={() => setError(null)}
                    >
                        Dismiss
                    </button>
                </div>
            )}
        </main>
    );
}

export default App;
