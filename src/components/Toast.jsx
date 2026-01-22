import { useEffect, useState } from "react";
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from "react-icons/fa";

export default function Toast({ type, message, onClose, duration = 4000 }) {
    const [progress, setProgress] = useState(100);

    useEffect(() => {
        const startTime = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining === 0) {
                clearInterval(interval);
                onClose();
            }
        }, 10);

        return () => clearInterval(interval);
    }, [duration, onClose]);

    const icons = {
        success: <FaCheckCircle className="text-green-400" />,
        error: <FaExclamationCircle className="text-red-400" />,
        info: <FaInfoCircle className="text-blue-400" />,
    };

    const colors = {
        success: "border-green-500/50 bg-green-500/10",
        error: "border-red-500/50 bg-red-500/10",
        info: "border-blue-500/50 bg-blue-500/10",
    };

    return (
        <div className={`fixed bottom-6 right-6 z-100 min-w-75 overflow-hidden rounded-lg border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-right-8 ${colors[type] || colors.info}`}>
            <div className="flex items-start gap-3 p-4">
                <div className="mt-0.5 shrink-0">{icons[type] || icons.info}</div>
                <div className="flex-1 text-sm font-medium text-(--on-surface)">
                    {message}
                </div>
                <button 
                    onClick={onClose}
                    className="shrink-0 text-(--on-surface-variant) hover:text-(--on-surface) transition-colors"
                >
                    <FaTimes size={14} />
                </button>
            </div>
            <div 
                className="h-1 bg-current opacity-30 transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
