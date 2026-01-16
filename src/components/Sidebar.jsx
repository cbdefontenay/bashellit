import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { GiHamburgerMenu } from "react-icons/gi";

export default function Sidebar() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        async function loadSidebarState() {
            const state = await invoke("get_sidebar_state");
            setIsSidebarOpen(state);
        }
        loadSidebarState();
    }, []);

    async function toggleSidebar() {
        const newState = await invoke("toggle_sidebar");
        setIsSidebarOpen(newState);
    }

    if (!isSidebarOpen) {
        return (
            <div className="h-screen bg-zinc-950 border-r border-zinc-800">
                <div className="pt-5 pl-4 pr-5">
                    <button
                        className="bg-transparent"
                        onClick={toggleSidebar}
                    >
                        <GiHamburgerMenu className="text-slate-50"/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-5 w-64 h-screen bg-zinc-950 border-r border-zinc-800 flex flex-col">
            <div className="pl-4">
                <button
                    className="bg-transparent"
                    onClick={toggleSidebar}
                >
                    <GiHamburgerMenu className="text-slate-50"/>
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
        </div>
    );
}