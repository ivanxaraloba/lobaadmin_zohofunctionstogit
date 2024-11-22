import React, { useRef } from 'react';

import { cn } from '@/lib/utils';
import { useTheme } from '@/providers/theme';
import { javascript } from '@codemirror/lang-javascript';
import { EditorView } from '@codemirror/view';
import { tags as t } from '@lezer/highlight';
import { monokai } from '@uiw/codemirror-theme-monokai';
import CodeMirror, {
  Decoration,
  MatchDecorator,
  Prec,
  ReactCodeMirrorProps,
  ViewPlugin,
} from '@uiw/react-codemirror';
import { Variable } from 'lucide-react';
import { createTheme } from 'thememirror';

import '@/assets/styles/code-viewer.css';

import { CONFIG_FUNCTION_VARIABLE } from '@/utils/constants';

import { Button } from '../ui/button';

interface ScriptViewerProps extends ReactCodeMirrorProps {
  value?: string;
  onChange?: (value: string, viewUpdate: any) => void;
  className?: string;
}

const decoratorHashtag = new MatchDecorator({
  regexp: CONFIG_FUNCTION_VARIABLE.REGEX,
  decoration: Decoration.mark({
    attributes: {
      style: `
       color: #FF00FF;
       font-weight: 800;
       `,
    },
  }),
});

const hightlightHashtag = ViewPlugin.fromClass(
  class {
    constructor(view: any) {
      // @ts-ignore
      this.decorations = decoratorHashtag.createDeco(view);
    }
    update(update: any) {
      // @ts-ignore
      this.decorations = decoratorHashtag.updateDeco(
        update,
        // @ts-ignore
        this.decorations,
      );
    }
  },
  {
    // @ts-ignore
    decorations: (v) => v.decorations,
  },
);

function ScriptViewer({
  value = '',
  onChange,
  className,
  editable = false,
  ...props
}: ScriptViewerProps) {
  const { theme } = useTheme();
  const editorRef = useRef<EditorView | null>(null);

  const myTheme = createTheme({
    variant: 'light',
    settings: {
      background: 'none',
      foreground: '#5e57b5',
      caret: '#5d00ff',
      selection: '#d8d8d8',
      lineHighlight: '#f0f0f0',
      gutterBackground: '#ffffff',
      gutterForeground: '#666666',
    },
    styles: [
      { tag: t.comment, color: '#9c9b96' },
      { tag: t.keyword, color: '#c69060' },
      { tag: t.string, color: '#d10000' },
      { tag: [t.number, t.bool], color: '#c6607c' },
      { tag: [t.operator, t.punctuation], color: '#666666' },
      { tag: t.function(t.variableName), color: '#c69060' },
      { tag: t.variableName, color: '#5e57b5' },
      { tag: t.definition(t.variableName), color: '#5e57b5' },
      { tag: t.special(t.variableName), color: '#ffff00' },
      { tag: t.brace, color: '#5e57b5' },
      { tag: t.literal, color: '#d10000' },
    ],
  });

  return (
    <div>
      <CodeMirror
        ref={(instance) => {
          if (instance && !editorRef.current) {
            // @ts-ignore
            editorRef.current = instance.view;
          }
        }}
        basicSetup={{
          lineNumbers: false,
          foldGutter: false,
        }}
        // onStatistics={(e) => console.log({ onStatistics: e })}
        className={cn('!border-none !outline-none', className)}
        value={value}
        theme={theme === 'light' ? myTheme : monokai}
        extensions={[
          javascript({ jsx: true }),
          Prec.highest(hightlightHashtag),
        ]}
        onChange={onChange}
        editable={editable}
        {...props}
      />
    </div>
  );
}

export default ScriptViewer;
