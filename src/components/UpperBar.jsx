import React from "react";
import { invoke } from "@tauri-apps/api/core";
import { TerminalIcon, SettingsIcon } from "./Icons.jsx";

const UpperBar = ({ onOpenSettings, activeFile, onError }) => {
  const handleOpenShell = async () => {
    if (!activeFile) {
      onError("No active file selected");
      return;
    }

    // Get the directory of the active file
    // Since we don't have a direct path helper in JS easily for all OS,
    // we can pass the full path and let Rust handle it or extract it here.
    // In bashellit, it determined the parent in Rust.
    // I'll do the same. I'll pass the parent directory.
    
    const lastSlash = activeFile.lastIndexOf("/");
    const lastBackslash = activeFile.lastIndexOf("\\");
    const index = Math.max(lastSlash, lastBackslash);
    const dir = index !== -1 ? activeFile.substring(0, index) : ".";

    try {
      await invoke("open_shell_in_dir", { dir });
    } catch (err) {
      onError(err.toString());
    }
  };

  return (
    <div className="h-8 bg-(--surface-container-highest) text-(--on-surface) border-b border-(--outline-variant) flex items-center justify-between px-4 flex-shrink-0">
      <div className="flex flex-row items-center justify-center w-full">
        <h1 className="font-bold text-(--primary)">bash@bashellit</h1>
      </div>

      <div className="flex items-center space-x-1">
        <button
          className="cursor-pointer p-2 hover:bg-(--surface-container-high) rounded-lg transition-colors group"
          title="Open Shell at Active File"
          onClick={handleOpenShell}
        >
          <TerminalIcon className="w-6 h-6 text-(--on-surface-variant) group-hover:text-(--primary) transition-colors" />
        </button>

        <button
          className="cursor-pointer p-2 hover:bg-(--surface-container-high) rounded-lg transition-colors group"
          title="Settings"
          onClick={onOpenSettings}
        >
          <SettingsIcon className="w-6 h-6 text-(--on-surface-variant) group-hover:text-(--primary) transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default UpperBar;
