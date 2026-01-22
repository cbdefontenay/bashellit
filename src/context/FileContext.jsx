import {createContext, useContext, useEffect, useState} from "react";
import {invoke} from "@tauri-apps/api/core";

const FileContext = createContext();

export function FileProvider({children}) {
    const [recentFiles, setRecentFiles] = useState([]);
    const [currentFile, setCurrentFile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadRecentFiles() {
            try {
                setIsLoading(true);
                const files = await invoke("get_recent_files");
                setRecentFiles(files);
            } catch (error) {
                console.error("Failed to load recent files:", error);
            } finally {
                setIsLoading(false);
            }
        }

        loadRecentFiles();
    }, []);

    const openFile = async () => {
        try {
            const files = await invoke("pick_bash_files");
            if (files && files.length > 0) {
                // Select the first picked file as current
                setCurrentFile(files[0]);

                // Add all files to recent files
                await invoke("add_recent_files", {newFiles: files});

                // Refresh recent files list
                const updatedFiles = await invoke("get_recent_files");
                setRecentFiles(updatedFiles);
            }
        } catch (error) {
            if (error !== "No file selected") {
                console.error("Error picking file:", error);
            }
        }
    };

    const selectFile = (file) => {
        setCurrentFile(file);
    };

    const removeFile = async (path) => {
        try {
            await invoke("remove_recent_file", {path});
            const updatedFiles = await invoke("get_recent_files");
            setRecentFiles(updatedFiles);

            if (currentFile && currentFile.path === path) {
                setCurrentFile(null);
            }
        } catch (error) {
            console.error("Failed to remove file:", error);
        }
    };

    const saveCurrentFile = async (content) => {
        if (!currentFile) return;

        try {
            await invoke("save_file", {path: currentFile.path, content});

            const updatedFile = {...currentFile, content};
            setCurrentFile(updatedFile);

            // Update in recent files list
            await invoke("add_recent_file", {file: updatedFile});
            const updatedFiles = await invoke("get_recent_files");
            setRecentFiles(updatedFiles);
        } catch (error) {
            console.error("Failed to save file:", error);
            throw error;
        }
    };

    const updateCurrentFileContent = (content) => {
        if (currentFile) {
            setCurrentFile({...currentFile, content});
        }
    };

    return (
        <FileContext.Provider value={{
            recentFiles,
            currentFile,
            isLoading,
            openFile,
            selectFile,
            removeFile,
            saveCurrentFile,
            updateCurrentFileContent
        }}>
            {children}
        </FileContext.Provider>
    );
}

export const useFile = () => useContext(FileContext);