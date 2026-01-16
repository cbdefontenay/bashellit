import {useState, useEffect} from "react";
import {RxCross1} from "react-icons/rx";
import {useTheme} from "../context/ThemeContext"; // Adjust the import path

export default function SettingsComponent({isOpen, onClose}) {
    const {theme, changeTheme, isLoading} = useTheme();
    const [currentTheme, setCurrentTheme] = useState(theme);

    // Update local state when theme changes from context
    useEffect(() => {
        setCurrentTheme(theme);
    }, [theme]);

    const handleThemeChange = async (newTheme) => {
        setCurrentTheme(newTheme);
        await changeTheme(newTheme);
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (isOpen && e.target.closest('.settings-popup') === null) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            return () => document.removeEventListener("mousedown", handleClickOutside);
        }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blur backdrop */}
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"/>

            {/* Settings popup */}
            <div
                className="settings-popup relative bg-(--surface) text-(--on-surface) rounded-lg shadow-lg p-6 w-96 max-w-[90vw] border border-(--outline-variant)">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-(--on-surface)">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-(--surface-variant) rounded-full transition-colors"
                        aria-label="Close settings"
                    >
                        <RxCross1 className="cursor-pointer w-5 h-5"/>
                    </button>
                </div>

                {/* Theme settings */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-(--on-surface)">Theme</h3>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleThemeChange("light")}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                        currentTheme === "light"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-12 h-12 rounded-full bg-(--surface-bright) border border-(--outline) mb-2"/>
                                        <span className="font-medium text-(--on-surface)">Light</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleThemeChange("dark")}
                                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                                        currentTheme === "dark"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-12 h-12 rounded-full bg-(--surface-dim) border border-(--outline) mb-2"/>
                                        <span className="font-medium text-(--on-surface)">Dark</span>
                                    </div>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Theme status indicator */}
                    <div className="text-sm text-(--on-surface-variant)">
                        Current theme: <span className="font-medium text-(--primary)">{currentTheme}</span>
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-6 pt-4 border-t border-(--surface-variant)">
                    <button
                        onClick={onClose}
                        className="cursor-pointer w-full py-2 bg-(--primary) text-(--on-primary) rounded-lg font-medium hover:opacity-90 transition-opacity"
                    >
                        Close Settings
                    </button>
                </div>
            </div>
        </div>
    );
}