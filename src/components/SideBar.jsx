import React from "react";
import { open } from "@tauri-apps/plugin-dialog";
import { FileIcon, HamburgerIcon, PlusIcon, TrashIcon } from "./Icons.jsx";

const SideBar = ({ isCollapsed, onToggle, settings, onSettingsChange }) => {
  const sidebarWidth = isCollapsed ? "w-14" : "w-64";
  const { recent_files, active_file } = settings;

  const handleImport = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{ name: "Bash Script", extensions: ["sh"] }],
      });

      if (selected) {
        const newRecentFiles = [...recent_files];
        let lastPath = active_file;
        let changed = false;

        const files = Array.isArray(selected) ? selected : [selected];

        files.forEach((file) => {
          if (!newRecentFiles.includes(file)) {
            newRecentFiles.push(file);
            changed = true;
          }
          lastPath = file;
        });

        if (changed || lastPath !== active_file) {
          onSettingsChange({
            ...settings,
            recent_files: newRecentFiles,
            active_file: lastPath,
          });
        }
      }
    } catch (err) {
      console.error("Failed to open file dialog:", err);
    }
  };

  const handleDelete = (pathToDelete) => {
    const newRecentFiles = recent_files.filter((p) => p !== pathToDelete);
    const newActiveFile = active_file === pathToDelete ? null : active_file;
    onSettingsChange({
      ...settings,
      recent_files: newRecentFiles,
      active_file: newActiveFile,
    });
  };

  const handleSelect = (pathToSelect) => {
    onSettingsChange({
      ...settings,
      active_file: pathToSelect,
    });
  };

  const getFileName = (path) => {
    const lastSlash = path.lastIndexOf("/");
    const lastBackslash = path.lastIndexOf("\\");
    const index = Math.max(lastSlash, lastBackslash);
    return index !== -1 ? path.substring(index + 1) : path;
  };

  return (
    <div
      className={`h-full rounded-tr-lg rounded-br-lg bg-(--surface-container) text-(--on-surface) border-r border-(--outline-variant) flex flex-col transition-all duration-300 ${sidebarWidth}`}
    >
      <div className="flex items-center h-16 px-4 flex-shrink-0 border-b border-(--outline-variant) justify-between">
        <div className="flex items-center">
          <button
            className="cursor-pointer hover:bg-(--surface-container-high) rounded-lg transition-colors flex items-center justify-center p-1"
            onClick={onToggle}
          >
            <HamburgerIcon className="w-6 h-6" />
          </button>
          {!isCollapsed && (
            <h2 className="ml-3 text-(--primary) text-xs font-bold uppercase tracking-widest truncate">
              Scripts
            </h2>
          )}
        </div>

        {!isCollapsed && (
          <button
            className="cursor-pointer p-1.5 hover:bg-(--primary-container) hover:text-(--on-primary-container) rounded-lg transition-all group"
            title="Import Script"
            onClick={handleImport}
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-(--outline-variant) scrollbar-track-transparent">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-4">
            <button
              className="cursor-pointer p-2 hover:bg-(--primary-container) hover:text-(--on-primary-container) rounded-lg transition-all"
              onClick={handleImport}
            >
              <PlusIcon className="w-6 h-6" />
            </button>
            {[...recent_files].reverse().map((path) => {
              const fileName = getFileName(path);
              const isActive = path === active_file;
              const activeClass = isActive
                ? "bg-(--primary-container) text-(--on-primary-container)"
                : "hover:bg-(--surface-container-highest)";

              return (
                <div
                  key={path}
                  className={`group relative flex items-center justify-center w-10 h-10 rounded-lg transition-colors cursor-pointer ${activeClass}`}
                  title={fileName}
                  onClick={() => handleSelect(path)}
                >
                  <FileIcon className="w-6 h-6 text-(--on-surface-variant) group-hover:text-(--primary)" />
                  <button
                    className="cursor-pointer absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-10"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(path);
                    }}
                  >
                    <TrashIcon className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="px-2 space-y-1">
            {[...recent_files].reverse().map((path) => {
              const fileName = getFileName(path);
              const isActive = path === active_file;
              const activeClass = isActive
                ? "bg-(--primary-container) text-(--on-primary-container)"
                : "hover:bg-(--surface-container-highest)";

              return (
                <div
                  key={path}
                  className={`w-full flex items-center p-2 rounded-lg transition-colors cursor-pointer group text-left ${activeClass}`}
                  onClick={() => handleSelect(path)}
                >
                  <FileIcon className="w-5 h-5 mr-3 text-(--on-surface-variant) group-hover:text-(--primary) flex-shrink-0" />
                  <div className="flex flex-col truncate flex-1">
                    <span className="text-sm font-medium truncate">
                      {fileName}
                    </span>
                    <span className="text-[10px] text-(--on-surface-variant) truncate opacity-60">
                      {path}
                    </span>
                  </div>
                  <button
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 hover:text-red-500 rounded transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(path);
                    }}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default SideBar;
