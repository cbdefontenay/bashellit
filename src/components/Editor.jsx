import {useEffect, useRef, useState, useCallback} from "react";
import CodeEditor from "react-simple-code-editor";
import prism from "prismjs";
import "prismjs/components/prism-bash";
import "prismjs/themes/prism-tomorrow.css";
import {useFile} from "../context/FileContext.jsx";
import {useTheme} from "../context/ThemeContext.jsx";
import {FaSave, FaCode, FaFileAlt, FaSync} from "react-icons/fa";
import {invoke} from "@tauri-apps/api/core";
import {getCurrentWindow} from "@tauri-apps/api/window";
import LaunchShell from "./LaunchShell.jsx";
import Toast from "./Toast.jsx";

export default function Editor({isResizing}) {
    const {theme} = useTheme();
    const {currentFile, saveCurrentFile, updateCurrentFileContent} = useFile();
    const [code, setCode] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [notice, setNotice] = useState(null);
    const [reloadPrompt, setReloadPrompt] = useState(null);

    const showNotice = useCallback((type, message) => {
        setNotice({ type, message });
    }, []);
    useEffect(() => {
        if (currentFile) {
            setCode(currentFile.content);
        } else {
            setCode("");
        }
    }, [currentFile?.path, currentFile?.content]);

    const handleSave = useCallback(async () => {
        if (!currentFile || isSaving) return;

        try {
            setIsSaving(true);
            await saveCurrentFile(code);
        } catch (error) {
            showNotice("error", `Failed to save: ${error?.message ?? String(error)}`);
        } finally {
            setIsSaving(false);
        }
    }, [currentFile, isSaving, saveCurrentFile, code, showNotice]);

    const formatCode = useCallback(() => {
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

        setCode(formattedLines.join('\n'));
    }, [code]);

    const checkFileChanges = useCallback(async () => {
        if (!currentFile || reloadPrompt) return;
        try {
            const externalContent = await invoke("read_file", {path: currentFile.path});
            if (externalContent !== currentFile.content) {
                if (code === currentFile.content) {
                    setCode(externalContent);
                    updateCurrentFileContent(externalContent);
                } else {
                    setReloadPrompt({ externalContent });
                }
            }
        } catch (e) {
            console.error("Failed to check file changes", e);
        }
    }, [currentFile, code, updateCurrentFileContent, reloadPrompt]);

    useEffect(() => {
        const unlistenPromise = getCurrentWindow().onFocusChanged(({payload: focused}) => {
            if (focused) checkFileChanges();
        });

        const interval = setInterval(checkFileChanges, 10000);

        return () => {
            unlistenPromise.then(unlisten => unlisten());
            clearInterval(interval);
        };
    }, [checkFileChanges]);

    useEffect(() => {
        if (!currentFile) return;

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
    }, [handleSave, formatCode, currentFile]);

    if (!currentFile) {
        return (
            <div className={`flex flex-col bg-(--surface-container-low) h-full flex-1 min-w-0 items-center justify-center text-(--on-surface-variant) ${isResizing ? 'select-none' : ''}`}>
                <div className="text-center p-12 border-2 border-dashed border-(--outline-variant) rounded-3xl bg-(--surface-container) shadow-inner animate-in fade-in zoom-in duration-500">
                    <div className="mb-4 flex justify-center">
                        <FaFileAlt size={48} className="opacity-20" />
                    </div>
                    <p className="text-xl font-semibold mb-2 text-(--on-surface)">No file selected</p>
                    <p className="text-sm max-w-xs mx-auto opacity-70">Import a bash file or select one from recent files to start editing with Bashellit.</p>
                </div>
            </div>
        );
    }

    const isModified = currentFile.content !== code;

    return (
        <div className={`flex flex-col bg-(--surface-container-low) h-full flex-1 min-w-0 overflow-hidden ${isResizing ? 'select-none' : ''} ${theme}`}>
            {/* Editor Toolbar */}
            <div className="h-12 border-b border-(--outline-variant) flex items-center justify-between px-4 bg-(--surface-container) shrink-0 shadow-sm z-20">
                <div className="flex items-center gap-4 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                        <FaCode className="text-(--primary) shrink-0" />
                        <span className="text-sm font-medium text-(--on-surface) truncate" title={currentFile.path}>
                            {currentFile.path.split(/[\\/]/).pop()}
                        </span>
                    </div>

                    {isModified && (
                        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-(--primary-container) text-(--on-primary-container) text-[10px] font-bold uppercase tracking-wider animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-(--primary)"></span>
                            Unsaved
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <LaunchShell />

                    <div className="h-4 w-px bg-(--outline-variant) mx-1"></div>

                    <button
                        onClick={formatCode}
                        title="Format Code (Ctrl+Alt+L)"
                        className="p-2 rounded-lg text-(--on-surface-variant) hover:bg-(--surface-container-high) transition-colors"
                    >
                        <FaCode size={14} />
                    </button>

                    <button
                        onClick={handleSave}
                        disabled={isSaving || !isModified}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all shadow-sm ${
                            !isModified
                                ? "bg-(--surface-container-high) text-(--on-surface-variant) opacity-50 cursor-not-allowed"
                                : "bg-(--primary) text-(--on-primary) hover:shadow-md active:scale-95"
                        }`}
                    >
                        {isSaving ? <FaSync className="animate-spin" size={14} /> : <FaSave size={14} />}
                        <span>{isSaving ? "Saving..." : "Save"}</span>
                    </button>
                </div>
            </div>

            {/* Editor Container with Line Numbers */}
            <div className={`flex-1 overflow-auto font-mono text-sm relative flex custom-editor-container selection:bg-blue-500/30 ${
                theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-(--surface-container-lowest)'
            }`}>
                {/* Line Numbers Gutter */}
                <div className="line-numbers text-right px-3 py-2.5 bg-(--surface-container) border-r border-(--outline-variant) text-(--on-surface-variant) select-none min-w-[48px] shrink-0 sticky left-0 z-10 opacity-60 font-mono text-[11px]">
                    {code.split('\n').map((_, i) => (
                        <div key={i} className="leading-6 h-6">
                            {i + 1}
                        </div>
                    ))}
                </div>

                <div className="flex-1 min-w-0">
                    <CodeEditor
                        value={code}
                        onValueChange={setCode}
                        highlight={code => prism.highlight(code, prism.languages.bash, "bash")}
                        padding={10}
                        className="editor-textarea min-h-full"
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", "Cascadia Code", "Source Code Pro", Menlo, Monaco, Consolas, "Courier New", monospace',
                            minHeight: '100%',
                            lineHeight: '24px',
                            backgroundColor: 'transparent',
                        }}
                    />
                </div>
            </div>

            {reloadPrompt && (
                <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-120 max-w-[90vw] rounded-2xl border border-(--outline-variant) bg-(--surface-container) p-6 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-3 mb-4 text-amber-500">
                            <FaSync className="animate-spin-slow" />
                            <h3 className="text-lg font-semibold text-(--on-surface)">File changed on disk</h3>
                        </div>

                        <p className="text-sm text-(--on-surface-variant) leading-relaxed">
                            The file <code className="px-1.5 py-0.5 rounded bg-(--surface-container-high) font-mono text-xs">{currentFile.path.split(/[\\/]/).pop()}</code> was modified externally.
                            Reloading will overwrite your current unsaved changes.
                        </p>

                        <div className="mt-8 flex justify-end gap-3">
                            <button
                                className="px-4 py-2 rounded-xl text-sm font-medium border border-(--outline-variant) text-(--on-surface) hover:bg-(--surface-container-high) transition-colors"
                                onClick={() => {
                                    updateCurrentFileContent(reloadPrompt.externalContent);
                                    setReloadPrompt(null);
                                    showNotice("info", "Kept local edits. Disk version updated.");
                                }}
                            >
                                Keep my edits
                            </button>

                            <button
                                className="px-4 py-2 rounded-xl text-sm font-semibold bg-(--primary) text-(--on-primary) hover:opacity-90 transition-all shadow-md active:scale-95"
                                onClick={() => {
                                    setCode(reloadPrompt.externalContent);
                                    updateCurrentFileContent(reloadPrompt.externalContent);
                                    setReloadPrompt(null);
                                    showNotice("success", "Reloaded from disk.");
                                }}
                            >
                                Reload from disk
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {notice && (
                <Toast
                    type={notice.type}
                    message={notice.message}
                    onClose={() => setNotice(null)}
                />
            )}
        </div>
    );
}