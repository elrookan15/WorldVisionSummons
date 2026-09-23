import { useEffect, useRef, useState } from "react";
import type { CodexRenderModel } from "../composition/types";
import { CodexPage } from "./CodexPage";

const PAGE_WIDTH_PX = (210 / 25.4) * 96;

export interface CodexPreviewShellProps {
  model: CodexRenderModel;
}

export function CodexPreviewShell({ model }: CodexPreviewShellProps) {
  const frame = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const node = frame.current;
    if (!node) return;
    const measure = () => {
      const width = node.clientWidth;
      setScale(width > 0 ? Math.min(1, width / PAGE_WIDTH_PX) : 1);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={frame} style={{ width: "100%", overflow: "auto", background: "#211813", padding: 16 }}>
      <div style={{ width: `calc(210mm * ${scale})`, height: `calc(297mm * ${scale})` }}>
        <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: "210mm", height: "297mm" }}>
          <CodexPage model={model} />
        </div>
      </div>
    </div>
  );
}
