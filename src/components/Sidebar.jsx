import {useState, useEffect} from "react";
import {invoke} from "@tauri-apps/api/core";
import {GiHamburgerMenu} from "react-icons/gi";
import SettingsComponent from "./SettingsComponent.jsx";
import {MdSettings} from "react-icons/md";

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        async function loadSidebarState() {
            const state = await invoke("get_sidebar_state");
            setIsSidebarOpen(state);
        }


        loadSidebarState();
    }, []);

    async function showSettingsPopup() {
        await invoke("show_settings", {showSettings: true});
    }

    async function toggleSidebar() {
        const newState = await invoke("toggle_sidebar");
        setIsSidebarOpen(newState);
    }

    if (!isSidebarOpen) {
        return (
            <div className="h-screen bg-(--surface-dim) text-(--on-surface) border-r border-(--scrim)">
                <div className="pt-5 pl-4 pr-5">
                    <button
                        className="cursor-pointer bg-transparent"
                        onClick={toggleSidebar}
                    >
                        <GiHamburgerMenu className="text-(on-surface)"/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="pt-5 w-64 h-screen bg-(--surface-dim) text-(--on-surface) border-r border-(--scrim) flex flex-col">
            <div className="pl-4">
                <button
                    className="bg-transparent"
                    onClick={toggleSidebar}
                >
                    <GiHamburgerMenu className="cursor-pointer text-(on-surface)"/>
                </button>
            </div>
            <div className="pt-4 pl-4 pb-2 border-b border-zinc-800">
                <h2 className="text-zinc-500 text-xs font-bold uppercase tracking-widest">
                    Recent Files
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
                {/* Sidebar content */}
            </div>
            <div className="mt-auto p-4 border-t border-(--outline)">
                <button
                    onClick={() => setShowSettings(showSettingsPopup)}
                    className="w-full cursor-pointer flex items-center gap-3 p-3 rounded-lg hover:bg-(--surface-variant) transition-colors text-(--on-surface)"
                >
                    <MdSettings className="w-5 h-5"/>
                    <span>Settings</span>
                </button>
            </div>

            {/* Settings popup */}
            <SettingsComponent
                isOpen={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </div>
    )
        ;
}