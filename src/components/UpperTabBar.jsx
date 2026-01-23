import {useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import SettingsComponent from "./SettingsComponent.jsx";

export default function UpperTabBar() {
    const [activeTab, setActiveTab] = useState("files");
    const [showSettings, setShowSettings] = useState(false);

    async function showSettingsPopup() {
        await invoke("show_settings", {showSettings: true});
    }

    return (
        <>
            <div className="h-8 bg-(--surface) text-(--on-surface) border-b border-(--outline-variant) flex items-center w-full">
                {/* Tabs */}
                <div className="flex h-full items-center font-mono">
                    {/*<button*/}
                    {/*    onClick={() => setActiveTab("files")}*/}
                    {/*    className={`h-full cursor-pointer px-3 text-xs font-medium transition-colors ${*/}
                    {/*        activeTab === "files"*/}
                    {/*            ? "bg-(--primary) text-(--on-primary) border-b-2 border-(--primary)"*/}
                    {/*            : "hover:bg-(--surface-variant) text-(--on-surface-variant)"*/}
                    {/*    }`}*/}
                    {/*>*/}
                    {/*    Files*/}
                    {/*</button>*/}

                    <button
                        onClick={() => {
                            setActiveTab("settings")
                            setShowSettings(showSettingsPopup)
                        }}
                        className={`h-full cursor-pointer px-3 text-xs font-medium transition-colors ${
                            activeTab === "settings"
                                ? "bg-(--primary) text-(--on-primary) border-b-2 border-(--primary)"
                                : "hover:bg-(--surface-variant) text-(--on-surface-variant)"
                        }`}
                    >
                        Settings
                    </button>
                </div>

                {/* Title in the middle */}
                <div className="flex-1 text-center">
                    <span className="text-xs font-semibold text-(--primary) uppercase tracking-wider font-mono">
                        Bashellit
                    </span>
                </div>

                {/* Empty div for balance */}
                <div className="w-20"></div>
            </div>
            <SettingsComponent
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}