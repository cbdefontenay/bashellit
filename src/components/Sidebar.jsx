import {useCallback, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";
import {GiHamburgerMenu} from "react-icons/gi";
import {FaRegFileCode, FaTimes} from "react-icons/fa";
import ImportBashFile from "./ImportBashFile.jsx";
import {useFile} from "../context/FileContext.jsx";

export default function Sidebar({onResizeStateChange}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [sidebarWidth, setSidebarWidth] = useState(256);
    const [isResizing, setIsResizing] = useState(false);
    const {recentFiles, currentFile, selectFile, removeFile} = useFile();

    useEffect(() => {
        onResizeStateChange(isResizing);
    }, [isResizing, onResizeStateChange]);

    useEffect(() => {
        async function loadSidebarState() {
            const state = await invoke("get_sidebar_state");
            setIsSidebarOpen(state);
        }

        loadSidebarState();
    }, []);

    const startResizing = useCallback((mouseDownEvent) => {
        setIsResizing(true);
    }, []);

    const stopResizing = useCallback(() => {
        setIsResizing(false);
    }, []);

    const resize = useCallback(
        (mouseMoveEvent) => {
            if (isResizing) {
                const newWidth = mouseMoveEvent.clientX;
                if (newWidth > 150 && newWidth < 600) {
                    setSidebarWidth(newWidth);
                }
            }
        },
        [isResizing]
    );

    useEffect(() => {
        window.addEventListener("mousemove", resize);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", resize);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [resize, stopResizing]);

    async function showSettingsPopup() {
        await invoke("show_settings", {showSettings: true});
    }

    async function toggleSidebar() {
        const newState = await invoke("toggle_sidebar");
        setIsSidebarOpen(newState);
    }

    if (!isSidebarOpen) {
        return (
            <div className="h-full bg-(--surface-container) text-(--on-surface) border-r border-(--outline-variant)">
                <div className="pt-3 pl-4 pr-5">
                    <button
                        className="cursor-pointer bg-transparent"
                        onClick={toggleSidebar}
                    >
                        <GiHamburgerMenu className="text-(--on-surface)"/>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            style={{width: sidebarWidth}}
            className={`rounded-lg pt-3 h-full bg-(--surface-container) text-(--on-surface) border-r border-(--outline-variant) flex flex-col relative group ${isResizing ? 'select-none' : ''}`}>
            <div className="flex flex-row items-center justify-between px-4">
                <button
                    className="bg-transparent"
                    onClick={toggleSidebar}>
                    <GiHamburgerMenu className="cursor-pointer text-(--on-surface)"/>
                </button>
                <ImportBashFile />
            </div>
            <div className="pt-4 pl-4 pb-2 border-b border-(--outline-variant)">
                <h2 className="text-(--on-surface-variant) text-xs font-bold uppercase tracking-widest">
                    Recent Files
                </h2>
            </div>
            <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-(--outline-variant) hover:scrollbar-thumb-(--outline)">
                {recentFiles.length === 0 ? (
                    <div className="text-xs text-(--on-surface-variant) italic p-4 text-center">
                        No recent files. Open one to get started.
                    </div>
                ) : (
                    <div className="space-y-1">
                        {recentFiles.map((file) => (
                            <div
                                key={file.path}
                                className={`group/item flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                                    currentFile?.path === file.path
                                        ? "bg-(--primary-container) text-(--on-primary-container)"
                                        : "hover:bg-(--surface-variant) text-(--on-surface)"
                                }`}
                                onClick={() => selectFile(file)}
                            >
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <FaRegFileCode className="shrink-0 text-(--primary)"/>
                                    <span className="text-sm truncate" title={file.path}>
                                        {file.name}
                                    </span>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        removeFile(file.path);
                                    }}
                                    className="opacity-0 group-hover/item:opacity-100 p-1 hover:bg-black/10 rounded transition-all"
                                    title="Remove from list"
                                >
                                    <FaTimes className="text-xs"/>
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Resizer handle */}
            <div
                onMouseDown={startResizing}
                className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-(--primary)/50 transition-colors z-10"
            />
        </div>
    )
        ;
}