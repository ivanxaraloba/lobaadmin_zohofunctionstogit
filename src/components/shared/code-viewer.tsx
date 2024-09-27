import React, { useEffect } from "react";

// @ts-ignore
import Prism from "prismjs";
import "prismjs/themes/prism.css";
import "@/assets/styles/code-viewer.css";
import { cn } from "@/lib/utils";

interface ScriptViewerProps {
  className?: string;
  script?: string;
  language?: "deluge" | "language";
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({
  script = "",
  language = "deluge",
  className,
}) => {
  useEffect(() => {
    Prism.highlightAll();
  }, [script, language]);

  return (
    <div className={cn(language, className)}>
      <pre className="language-javascript">
        <code className="language-javascript">{script}</code>
      </pre>
    </div>
  );
};

export default ScriptViewer;
