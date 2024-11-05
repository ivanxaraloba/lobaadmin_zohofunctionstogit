import React, { useState } from 'react';

import { chatgptGenerateFunctionDoc } from '@/helpers/chatgpt';
import { useMutation } from '@tanstack/react-query';
import { saveAs } from 'file-saver';
import htmlDocx from 'html-docx-js/dist/html-docx';
import { Download, FileCode2, Frown, Wand2Icon } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { Button } from '../ui/button';
import ButtonLoading from '../ui/button-loading';
import SectionMissing from './section-missing';

export default function ButtonGenerateDoc({
  functionName,
  code,
}: {
  functionName: string;
  code: string;
}) {
  const [docContent, setDocContent] = useState<string | null>(null);

  const mutationGenerate = useMutation({
    mutationFn: async () => {
      const response = await chatgptGenerateFunctionDoc(
        `Generate documentation for the following function
        - Function Name: ${functionName}
        - Code: ${code}`,
      );
      return response.choices[0].message.content;
    },
    onSuccess: (content) => {
      setDocContent(content);
    },
    onError: (err: any) => {
      console.error('Error generating documentation:', err);
      setDocContent(null);
    },
  });

  const mutationExport = useMutation({
    mutationFn: async () => {
      if (!docContent) return;

      // Convert Markdown to HTML
      const htmlContent = `
        <html>
          <head>
            <style>
              /* Add styling similar to your component styles */
              body { font-family: Arial, sans-serif; }
              h1, h2, h3, h4 { color: #333; }
              .prose-sm { font-size: 14px; }
              .dark .prose-invert { color: #f0f0f0; }
            </style>
          </head>
          <body>
            <article class="prose prose-sm dark:prose-invert">
              ${docContent}
            </article>
          </body>
        </html>
      `;

      console.log({ htmlContent });

      // Convert HTML to .docx
      const docxBlob = htmlDocx.asBlob(htmlContent);
      console.log(docxBlob);

      saveAs(docxBlob, `${functionName}_documentation.docx`);
    },
  });

  return (
    <Dialog>
      <DialogTrigger>
        <Button variant="ghost" size="icon">
          <FileCode2 className="size-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-4xl">
        <div className="flex w-full items-center">
          <DialogHeader>
            <DialogTitle>Documentation</DialogTitle>
            <DialogDescription>
              Create documentation for this function using ChatGPT
            </DialogDescription>
          </DialogHeader>
          <ButtonLoading
            icon={Wand2Icon}
            className="ml-auto"
            variant="secondary"
            loading={mutationGenerate.isPending}
            onClick={() => mutationGenerate.mutate()}
          >
            <span>Generate</span>
          </ButtonLoading>
        </div>
        <div className="grid">
          {docContent ? (
            <>
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                className="prose prose-sm max-h-[500px] w-full !max-w-none overflow-auto dark:prose-invert"
              >
                {docContent}
              </ReactMarkdown>
              <ButtonLoading
                icon={Download}
                className="mt-4 w-full"
                variant="secondary"
                loading={mutationExport.isPending}
                onClick={() => mutationExport.mutate()}
              >
                <span>Export as .docx</span>
              </ButtonLoading>
            </>
          ) : (
            <SectionMissing icon={Frown} message="No documentation available" />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
