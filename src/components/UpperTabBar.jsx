import { useState } from "react";

export default function UpperTabBar() {
    const [activeTab, setActiveTab] = useState("files");

    return (
        <div className="h-10 bg-(--surface) text-(--on-surface) border-b border-(--outline) flex items-center">
            {/* Tabs */}
            <div className="flex h-full">
                <button
                    onClick={() => setActiveTab("files")}
                    className={`cursor-pointer px-6 text-sm font-medium transition-colors ${
                        activeTab === "files"
                            ? "bg-(--primary) text-(--on-primary) border-b-2 border-(--primary)"
                            : "hover:bg-(--surface-variant) text-(--on-surface-variant)"
                    }`}
                >
                    Files
                </button>

                <button
                    onClick={() => setActiveTab("settings")}
                    className={`px-6 text-sm font-medium transition-colors ${
                        activeTab === "settings"
                            ? "bg-(--primary) text-(--on-primary) border-b-2 border-(--primary)"
                            : "hover:bg-(--surface-variant) text-(--on-surface-variant)"
                    }`}
                >
                    Settings
                </button>
            </div>

            {/* Title in the middle */}
            <div className="flex-1 text-center">
                <span className="text-sm font-semibold text-(--primary)">Code Editor</span>
            </div>

            {/* Empty div for balance */}
            <div className="w-24"></div>
        </div>
    );
}