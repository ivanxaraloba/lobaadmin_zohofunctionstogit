import React, { useEffect, useState } from 'react';

// @ts-ignore
import Prism from 'prismjs';

import 'prismjs/themes/prism.css';
import '@/assets/styles/code-viewer.css';

import { cn } from '@/lib/utils';

interface ScriptViewerProps {
  className?: string;
  script?: string;
  language?: 'deluge' | 'language';
  highlight?: string;
}

const ScriptViewer: React.FC<ScriptViewerProps> = ({
  script = '',
  language = 'deluge',
  className,
  highlight = '',
}) => {
  const [highlightedScript, setHighlightedScript] = useState('');

  useEffect(() => {
    if (!script) {
      setHighlightedScript('');
      return;
    }

    let prismHighlightedScript = Prism.highlight(
      script,
      Prism.languages.javascript,
      'javascript',
    );

    if (highlight) {
      prismHighlightedScript = prismHighlightedScript.replace(
        new RegExp(`\\b${highlight}\\b`, 'g'),
        `<mark>${highlight}</mark>`,
      );
    }

    setHighlightedScript(prismHighlightedScript);
  }, [script, language, highlight]);

  return (
    <div className={cn(language, className)}>
      <pre className="language-javascript">
        <code
          className="language-javascript"
          dangerouslySetInnerHTML={{ __html: highlightedScript }}
        />
      </pre>
    </div>
  );
};

export default ScriptViewer;
