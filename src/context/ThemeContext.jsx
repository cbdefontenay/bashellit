import { createContext, useContext, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
    const [theme, setTheme] = useState("light");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadTheme() {
            try {
                setIsLoading(true);
                const savedTheme = await invoke("store_and_get_theme");
                setTheme(savedTheme);
                document.body.className = savedTheme;
            } catch (error) {
                document.body.className = "light";
            } finally {
                setIsLoading(false);
            }
        }

        loadTheme();

        const handleThemeChange = (e) => {
            setTheme(e.detail.theme);
        };

        window.addEventListener("themechange", handleThemeChange);
        return () => window.removeEventListener("themechange", handleThemeChange);
    }, []);

    const changeTheme = async (newTheme) => {
        try {
            await invoke("store_and_set_theme", { appTheme: newTheme });

            setTheme(newTheme);
            document.body.className = newTheme;

            window.dispatchEvent(new CustomEvent("themechange", { detail: { theme: newTheme } }));
        } catch (error) {
            console.error("Failed to save theme:", error);
        }
    };

    return (
        <ThemeContext.Provider value={{ theme, changeTheme, isLoading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);