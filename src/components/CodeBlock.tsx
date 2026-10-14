import React, { useState } from 'react';
import { Check, Copy, Terminal } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  filename,
  showLineNumbers = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-3 overflow-hidden rounded-lg border border-[#1b253b] bg-[#070b18] text-xs font-mono shadow-xl">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between border-b border-[#1b253b] bg-[#0a1022] px-3.5 py-2">
        <div className="flex items-center gap-2 text-slate-400">
          <Terminal className="h-3.5 w-3.5 text-cyan-400" />
          <span className="font-semibold text-slate-300">
            {filename || language.toUpperCase()}
          </span>
          {filename && (
            <span className="text-[11px] text-slate-500">· {language}</span>
          )}
        </div>

        <button
          onClick={handleCopy}
          type="button"
          aria-label="Copiar código"
          className="flex items-center gap-1.5 rounded bg-[#101935] px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-cyan-950/60 hover:text-cyan-300"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-emerald-400" />
              <span className="text-emerald-400">Copiado!</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3 text-slate-400" />
              <span>Copiar código</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body */}
      <div className="relative overflow-x-auto p-4 text-slate-200">
        <pre className="font-mono leading-relaxed">
          <code>
            {lines.map((line, index) => (
              <div key={index} className="table-row">
                {showLineNumbers && (
                  <span
                    aria-hidden="true"
                    className="table-cell select-none pr-4 text-right text-[11px] text-slate-600 tabular-nums"
                  >
                    {index + 1}
                  </span>
                )}
                <span className="table-cell whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
};
