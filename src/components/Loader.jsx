import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-(--surface) transition-opacity duration-500">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-(--primary-container) border-t-(--primary) rounded-full animate-spin"></div>
        <h2 className="mt-4 text-xl font-bold text-(--primary) animate-pulse">
          Bashellit
        </h2>
        <p className="mt-2 text-(--on-surface-variant) text-sm">
          Loading your terminal experience...
        </p>
      </div>
    </div>
  );
};

export default Loader;
