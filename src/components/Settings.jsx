import React from "react";

const themes = [
  { id: "light", name: "Light Indigo", primary: "#6366f1" },
  { id: "dark", name: "Dark Teal", primary: "#2dd4bf" },
  { id: "kali", name: "Kali Linux", primary: "#5573e8" },
  { id: "bash-dark", name: "Terminal Dark", primary: "#4af626" },
  { id: "bash-light", name: "Terminal Light", primary: "#000000" },
];

const Settings = ({ settings, onSettingsChange, onClose }) => {
  const handleThemeChange = (themeId) => {
    onSettingsChange({
      ...settings,
      theme: themeId,
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      <div className="relative w-full max-w-md bg-(--surface) rounded-2xl shadow-2xl border border-(--outline-variant) overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-(--outline-variant) flex items-center justify-between bg-(--surface-container)">
          <h2 className="text-xl font-bold text-(--on-surface)">Settings</h2>
          <button
            className="p-1 hover:bg-(--surface-container-high) rounded-full transition-colors cursor-pointer"
            onClick={onClose}
          >
            <span className="text-2xl leading-none">×</span>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <h3 className="text-sm font-bold text-(--primary) uppercase tracking-wider mb-4">
              Appearance
            </h3>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  className={`w-full flex items-center p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    settings.theme === t.id
                      ? "border-(--primary) bg-(--primary-container)/20"
                      : "border-transparent bg-(--surface-container-low) hover:border-(--outline-variant)"
                  }`}
                  onClick={() => handleThemeChange(t.id)}
                >
                  <div
                    className="w-4 h-4 rounded-full mr-3 shadow-sm"
                    style={{ backgroundColor: t.primary }}
                  ></div>
                  <span className="flex-1 text-left font-medium text-(--on-surface)">
                    {t.name}
                  </span>
                  {settings.theme === t.id && (
                    <span className="text-(--primary) font-bold text-xs uppercase tracking-widest">
                      Active
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="pt-4 border-t border-(--outline-variant)">
            <p className="text-center text-xs text-(--on-surface-variant) opacity-50">
              Bashellite v0.1.0 • Built with Tauri & React
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
