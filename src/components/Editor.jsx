import { useState, useEffect, useRef } from "react";
import CodeEditor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import { useFile } from "../context/FileContext.jsx";
import { FaSave } from "react-icons/fa";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Editor({ isResizing }) {
    const { currentFile, saveCurrentFile, updateCurrentFileContent } = useFile();
    const [code, setCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const lastCheckedContent = useRef("");

    useEffect(() => {
        if (currentFile) {
            setCode(currentFile.content);
            lastCheckedContent.current = currentFile.content;
        } else {
            setCode("");
            lastCheckedContent.current = "";
        }
    }, [currentFile?.path]);

    const handleSave = async () => {
        if (!currentFile || isSaving) return;

        try {
            setIsSaving(true);
            await saveCurrentFile(code);
            lastCheckedContent.current = code;
        } catch (error) {
            alert("Failed to save: " + error);
        } finally {
            setIsSaving(false);
        }
    };

    const formatCode = () => {
        const lines = code.split('\n');
        let indentLevel = 0;
        const indentSize = 4;

        const formattedLines = lines.map(line => {
            let trimmed = line.trim();

            // Decrease indent before current line if it starts with a closing keyword
            if (trimmed.match(/^(done|fi|esac|\}|elif|else)$/) || trimmed.startsWith('}')) {
                indentLevel = Math.max(0, indentLevel - 1);
            }

            const indent = ' '.repeat(indentLevel * indentSize);
            const formatted = indent + trimmed;

            // Increase indent after current line if it ends with an opening keyword
            if (trimmed.match(/(\s|^)(then|do|\{|else|elif)$/) ||
                trimmed.endsWith('{') ||
                (trimmed.match(/^(if|for|while|case|function)/) && !trimmed.match(/;.*(fi|done|esac|)$/))) {
                indentLevel++;
            }

            return formatted;
        });

        const formattedCode = formattedLines.join('\n');
        setCode(formattedCode);
    };

    const checkFileChanges = async () => {
        if (!currentFile) return;
        try {
            const externalContent = await invoke("read_file", { path: currentFile.path });
            if (externalContent !== currentFile.content) {
                // The file on disk is different from what we think it is
                if (code === currentFile.content) {
                    // No unsaved changes, just update
                    setCode(externalContent);
                    updateCurrentFileContent(externalContent);
                } else {
                    // User has unsaved changes
                    if (confirm("The file has been modified externally. Do you want to reload it? This will overwrite your current changes.")) {
                        setCode(externalContent);
                        updateCurrentFileContent(externalContent);
                    } else {
                        // User chose to keep their changes, but we should update our reference of what's on disk
                        // to avoid repeated prompts if we use more sophisticated logic later.
                        // For now, let's just update the content in the currentFile context so the 'unsaved' dot reflects reality vs disk
                        updateCurrentFileContent(externalContent);
                    }
                }
            }
        } catch (e) {
            console.error("Failed to check file changes", e);
        }
    };

    useEffect(() => {
        // Check for changes when window gains focus
        const unlistenPromise = getCurrentWindow().onFocusChanged(({ payload: focused }) => {
            if (focused && currentFile) {
                checkFileChanges();
            }
        });

        // Periodic check every 5 seconds as well
        const interval = setInterval(() => {
            if (document.hasFocus()) {
                checkFileChanges();
            }
        }, 5000);

        return () => {
            unlistenPromise.then(unlisten => unlisten());
            clearInterval(interval);
        };
    }, [currentFile, code]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                handleSave();
            }
            if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'l') {
                e.preventDefault();
                formatCode();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [code, currentFile, isSaving]);

    if (!currentFile) {
        return (
            <div className={`flex flex-col bg-(--surface-container-low) h-full flex-1 min-w-0 items-center justify-center text-(--on-surface-variant) ${isResizing ? 'select-none' : ''}`}>
                <div className="text-center p-8 border-2 border-dashed border-(--outline-variant) rounded-xl">
                    <p className="text-lg font-medium mb-2">No file selected</p>
                    <p className="text-sm">Import a bash file or select one from recent files to start editing.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`ml-2 flex flex-col bg-(--surface-container-low) h-full flex-1 min-w-0 ${isResizing ? 'select-none' : ''}`}>
            {/* Editor Toolbar */}
            <div className="rounded-t-lg h-10 border-b border-(--outline-variant) flex items-center justify-between px-4 bg-(--surface-container) shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-(--on-surface-variant) truncate max-w-75" title={currentFile.path}>
                        {currentFile.path}
                    </span>
                    {currentFile.content !== code && (
                        <span className="w-2 h-2 rounded-full bg-(--primary) animate-pulse" title="Unsaved changes"></span>
                    )}
                </div>
                <button
                    onClick={handleSave}
                    disabled={isSaving || currentFile.content === code}
                    className={`flex items-center gap-2 px-3 py-1 rounded text-xs font-medium transition-all ${
                        currentFile.content === code
                            ? "opacity-50 grayscale cursor-not-allowed"
                            : "bg-(--primary) text-(--on-primary) hover:opacity-90 active:scale-95"
                    }`}
                >
                    <FaSave className={isSaving ? "animate-spin" : ""} />
                    {isSaving ? "Saving..." : "Save"}
                </button>
            </div>

            {/* Editor Container with Line Numbers */}
            <div className="flex-1 overflow-auto font-mono text-sm relative flex custom-editor-container">
                {/* Line Numbers Gutter */}
                <div className="line-numbers text-right px-3 py-2.5 bg-(--surface-container) border-r border-(--outline-variant) text-(--on-surface-variant) select-none min-w-[45px] shrink-0 sticky left-0 z-10">
                    {code.split('\n').map((_, i) => (
                        <div key={i} className="leading-6">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <div className="flex-1 min-w-0">
                    <CodeEditor
                        value={code}
                        onValueChange={code => setCode(code)}
                        highlight={code => prism.highlight(code, prism.languages.bash, "bash")}
                        padding={10}
                        className="editor-textarea min-h-full"
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
                            minHeight: '100%',
                            lineHeight: '24px',
                        }}
                    />
                </div>
            </div>

            <style>{`
                .editor-textarea textarea {
                    outline: none !important;
                }
                .editor-textarea pre {
                    white-space: pre !important;
                }
            `}</style>
        </div>
    );
}