import React, { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { SaveIcon } from "./Icons.jsx";
import HighlightedLine from "./HighlightedLine.jsx";

const Editor = ({ activeFile, onError }) => {
  const [content, setContent] = useState("");
  const [currentFile, setCurrentFile] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const textareaRef = useRef(null);

  useEffect(() => {
    const loadFile = async () => {
      if (activeFile && activeFile !== currentFile) {
        try {
          const text = await invoke("read_file", { path: activeFile });
          setContent(text);
          setCurrentFile(activeFile);
          setIsDirty(false);
          await invoke("set_dirty_state", { isDirty: false });
        } catch (err) {
          onError(`Failed to read file: ${err}`);
        }
      } else if (!activeFile) {
        setContent("");
        setCurrentFile(null);
        setIsDirty(false);
        await invoke("set_dirty_state", { isDirty: false });
      }
    };
    loadFile();
  }, [activeFile, currentFile, onError]);

  const handleSave = async () => {
    if (activeFile) {
      try {
        await invoke("save_file", { path: activeFile, content });
        setIsDirty(false);
        await invoke("set_dirty_state", { isDirty: false });
      } catch (err) {
        onError(`Failed to save file: ${err}`);
      }
    }
  };

  const handleFormat = async () => {
    try {
      const start = textareaRef.current?.selectionStart;
      const end = textareaRef.current?.selectionEnd;

      const formatted = await invoke("format_bash", { content });
      if (formatted !== content) {
        setContent(formatted);
        setIsDirty(true);
        await invoke("set_dirty_state", { isDirty: true });

        // Restore cursor position in next tick
        setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.selectionStart = start;
            textareaRef.current.selectionEnd = end;
          }
        }, 0);
      }
    } catch (err) {
      onError(`Formatting error: ${err}`);
    }
  };

  const handleContentChange = async (newContent) => {
    setContent(newContent);
    if (!isDirty) {
      setIsDirty(true);
      await invoke("set_dirty_state", { isDirty: true });
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      handleSave();
    } else if (e.ctrlKey && e.altKey && e.key === "l") {
      e.preventDefault();
      handleFormat();
    } else if (e.key === "Tab") {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const value = e.target.value;
      const newValue = value.substring(0, start) + "    " + value.substring(end);
      handleContentChange(newValue);
      
      // Reset cursor position in next tick
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const displayLines = content.split("\n");

  return (
    <div className="h-full flex-1 bg-(--background) text-(--on-background) p-6 flex flex-col overflow-hidden">
      {activeFile ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-(--primary-container) text-(--on-primary-container) rounded">
                <span className="text-[10px] font-bold uppercase">bash</span>
              </div>
              <span className="text-sm font-medium opacity-80 truncate max-w-md select-all">
                {activeFile}
              </span>
              {isDirty && (
                <div className="w-2 h-2 rounded-full bg-(--primary) animate-pulse" title="Unsaved changes"></div>
              )}
            </div>

            <button
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg transition-all shadow-sm cursor-pointer group ${
                isDirty 
                  ? "bg-(--primary) text-(--on-primary) hover:opacity-90" 
                  : "bg-(--surface-container-high) text-(--on-surface-variant) opacity-60 hover:opacity-100"
              }`}
              onClick={handleSave}
            >
              <SaveIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold">Save</span>
            </button>
          </div>

          <div className="flex-1 w-full bg-(--surface-container-low) rounded-xl border border-(--outline-variant) shadow-inner flex overflow-hidden">
            <div className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-(--outline-variant) scrollbar-track-transparent flex">
              <div className="sticky left-0 bg-(--surface-container) border-r border-(--outline-variant) py-4 flex flex-col items-end px-3 select-none z-10">
                {displayLines.map((_, i) => (
                  <div
                    key={i}
                    className="text-xs font-mono text-(--on-surface-variant) opacity-30 h-[1.625rem] leading-[1.625rem]"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              <div className="relative grid flex-1 min-w-max">
                <div
                  className="col-start-1 row-start-1 p-4 font-mono text-sm whitespace-pre pointer-events-none"
                  style={{ lineHeight: "1.625rem" }}
                >
                  {displayLines.map((line, i) => (
                    <div key={i} className="h-[1.625rem] leading-[1.625rem]">
                      <HighlightedLine line={line} />
                    </div>
                  ))}
                </div>

                <textarea
                  ref={textareaRef}
                  className="col-start-1 row-start-1 w-full h-full p-4 font-mono text-sm bg-transparent text-transparent caret-(--primary) resize-none outline-none border-none whitespace-pre overflow-hidden"
                  style={{ lineHeight: "1.625rem" }}
                  value={content}
                  onChange={(e) => handleContentChange(e.target.value)}
                  onKeyDown={handleKeyDown}
                  spellCheck={false}
                  wrap="off"
                />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-(--on-surface-variant) opacity-40 space-y-4">
          <div className="w-24 h-24 rounded-full bg-(--surface-container) flex items-center justify-center">
            <span className="text-4xl">📄</span>
          </div>
          <p className="text-lg font-medium">No script selected</p>
          <p className="text-sm">Import or select a .sh file from the sidebar</p>
        </div>
      )}
    </div>
  );
};

export default Editor;
