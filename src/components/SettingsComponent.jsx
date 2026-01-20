import {useState, useEffect} from "react";
import {RxCross1} from "react-icons/rx";
import {useTheme} from "../context/ThemeContext";

export default function SettingsComponent({isOpen, onClose}) {
    const {theme, changeTheme, isLoading} = useTheme();
    const [currentTheme, setCurrentTheme] = useState(theme);

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
                    <h2 className="text-xl font-bold text-(--on-surface)">
                        Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-(--surface-variant) rounded-full transition-colors"
                        aria-label="Close settings"
                    >
                        <RxCross1 className="cursor-pointer w-5 h-5"/>
                    </button>
                </div>

                {/* Theme settings */}
                <div className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-3 text-(--on-surface) flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-(--primary) rounded-full"></span>
                            Theme
                        </h3>
                        {isLoading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-(--primary)"></div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleThemeChange("light")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        currentTheme === "light"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#f8fafd] border border-gray-300 mb-2 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#6366f1]/20 to-transparent"></div>
                                        </div>
                                        <span className="font-medium text-xs text-(--on-surface)">Light</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleThemeChange("dark")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        currentTheme === "dark"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#0d1117] border border-gray-700 mb-2 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#2dd4bf]/20 to-transparent"></div>
                                        </div>
                                        <span className="font-medium text-xs text-(--on-surface)">Dark</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleThemeChange("kali")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        currentTheme === "kali"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#0d0f12] border-2 border-[#5573e8] mb-2 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#5573e8]/20 to-transparent"></div>
                                        </div>
                                        <span className="font-medium text-xs text-(--on-surface)">Kali</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleThemeChange("bash-dark")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        currentTheme === "bash-dark"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#000000] border-2 border-[#4af626] mb-2 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#4af626]/20 to-transparent"></div>
                                        </div>
                                        <span className="font-medium text-xs text-(--on-surface)">Bash Dark</span>
                                    </div>
                                </button>

                                <button
                                    onClick={() => handleThemeChange("bash-light")}
                                    className={`p-3 rounded-lg border-2 transition-all ${
                                        currentTheme === "bash-light"
                                            ? "border-(--primary) bg-(--primary-container)"
                                            : "border-(--surface-variant) hover:border-(--outline)"
                                    }`}
                                >
                                    <div className="flex flex-col items-center cursor-pointer">
                                        <div
                                            className="w-10 h-10 rounded-full bg-[#ffffff] border-2 border-[#000000] mb-2 shadow-inner overflow-hidden relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-[#000000]/10 to-transparent"></div>
                                        </div>
                                        <span className="font-medium text-xs text-(--on-surface)">Bash Light</span>
                                    </div>
                                </button>
                            </div>
                        ) }
                    </div>

                    <div className="pt-2">
                        <h3 className="text-lg font-semibold mb-3 text-(--on-surface) flex items-center gap-2">
                            <span className="w-1.5 h-6 bg-(--primary) rounded-full"></span>
                            Keyboard Shortcuts
                        </h3>
                        <div className="space-y-2 font-mono text-sm">
                            <div className="flex justify-between items-center p-2 rounded bg-(--surface-container)">
                                <span className="text-(--on-surface-variant)">Save File</span>
                                <span className="px-2 py-0.5 rounded bg-(--primary) text-(--on-primary) text-xs">Ctrl + S</span>
                            </div>
                            <div className="flex justify-between items-center p-2 rounded bg-(--surface-container)">
                                <span className="text-(--on-surface-variant)">Format Code</span>
                                <span className="px-2 py-0.5 rounded bg-(--primary) text-(--on-primary) text-xs">Ctrl + Alt + L</span>
                            </div>
                        </div>
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