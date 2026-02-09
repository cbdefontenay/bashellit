import React, { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";

const HighlightedLine = ({ line }) => {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const highlight = async () => {
      try {
        const result = await invoke("highlight_bash", { line });
        setRegions(result);
      } catch (err) {
        console.error("Highlight error:", err);
        setRegions([{ text: line, class: "text-(--on-surface)" }]);
      }
    };
    highlight();
  }, [line]);

  return (
    <span className="whitespace-pre">
      {regions.map((region, i) => (
        <span key={i} className={region.class}>
          {region.text}
        </span>
      ))}
    </span>
  );
};

export default HighlightedLine;
