// LaunchShell.jsx
import { FaTerminal } from "react-icons/fa";
import { invoke } from "@tauri-apps/api/core";
import { useFile } from "../context/FileContext.jsx";

export default function LaunchShell() {
    const { currentFile } = useFile();

    async function handleLaunchShell() {
        if (!currentFile?.path) {
            alert("No file is currently open.");
            return;
        }

        try {
            await invoke("launch_shell", {
                filePath: currentFile.path
            });
        } catch (error) {
            console.error("Failed to launch shell:", error);
            alert(`Failed to launch terminal: ${error}`);
        }
    }

    // Only show button when a file is open
    if (!currentFile?.path) {
        return null;
    }

    return (
        <button
            onClick={handleLaunchShell}
            className="flex items-center gap-2 px-3 py-1 rounded text-xs font-medium bg-(--surface-variant) text-(--on-surface-variant) hover:bg-(--surface-variant-hover) active:scale-95 transition-all"
            title={`Open terminal in ${currentFile.path.split('/').slice(0, -1).join('/')}`}
        >
            <FaTerminal />
            Open Terminal
        </button>
    );
}