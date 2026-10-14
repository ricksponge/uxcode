import React, { useState } from 'react';
import { Check, Copy, Terminal, Code2, FileCode } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  // Découper le contenu en segments (texte vs blocs de code)
  const segments = parseMarkdown(content);

  return (
    <div className="space-y-3 text-sm text-zinc-200 leading-relaxed font-sans">
      {segments.map((segment, idx) => {
        if (segment.type === 'code') {
          return <CodeBlock key={idx} language={segment.language} code={segment.code} />;
        }
        return <TextBlock key={idx} text={segment.text} />;
      })}
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageIcon = (lang: string) => {
    const l = lang.toLowerCase();
    if (l === 'bash' || l === 'sh' || l === 'shell' || l === 'zsh') {
      return <Terminal className="w-3.5 h-3.5 text-emerald-400" />;
    }
    if (l === 'json' || l === 'yaml' || l === 'yml') {
      return <FileCode className="w-3.5 h-3.5 text-amber-400" />;
    }
    return <Code2 className="w-3.5 h-3.5 text-sky-400" />;
  };

  const lines = code.trim().split('\n');

  return (
    <div className="my-3 rounded-lg border border-zinc-800 bg-zinc-950/90 overflow-hidden shadow-md">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-zinc-900/80 border-b border-zinc-800/80 text-xs text-zinc-400">
        <div className="flex items-center gap-2">
          {getLanguageIcon(language)}
          <span className="font-mono uppercase font-semibold tracking-wider text-[11px] text-zinc-300">
            {language || 'code'}
          </span>
          <span className="text-[10px] text-zinc-600">({lines.length} lignes)</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors cursor-pointer"
          title="Copier le code"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copié</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-zinc-400" />
              <span>Copier</span>
            </>
          )}
        </button>
      </div>

      <div className="p-3 overflow-x-auto text-xs font-mono">
        <table className="border-collapse w-full">
          <tbody>
            {lines.map((line, lineIdx) => {
              // Coloration syntaxique simple et élégante
              let lineClass = 'text-zinc-200';
              if (line.trim().startsWith('#') || line.trim().startsWith('//')) {
                lineClass = 'text-zinc-500 italic';
              } else if (line.trim().startsWith('+')) {
                lineClass = 'text-emerald-400 bg-emerald-950/20';
              } else if (line.trim().startsWith('-')) {
                lineClass = 'text-rose-400 bg-rose-950/20';
              }

              return (
                <tr key={lineIdx} className="hover:bg-zinc-900/50 leading-5">
                  <td className="pr-4 text-right select-none text-zinc-600 text-[11px] font-mono w-8 align-top">
                    {lineIdx + 1}
                  </td>
                  <td className={`whitespace-pre pl-2 ${lineClass}`}>{line || ' '}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const TextBlock: React.FC<{ text: string }> = ({ text }) => {
  // Découpage par ligne pour repérer les titres, listes et blocs de citation
  const lines = text.split('\n');

  return (
    <div className="space-y-2">
      {lines.map((line, i) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('### ')) {
          return (
            <h3 key={i} className="text-base font-semibold text-zinc-100 mt-4 mb-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
              {trimmed.replace('### ', '')}
            </h3>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2 pb-1 border-b border-zinc-800">
              {trimmed.replace('## ', '')}
            </h2>
          );
        }
        if (trimmed.startsWith('# ')) {
          return (
            <h1 key={i} className="text-xl font-bold text-white mt-4 mb-2">
              {trimmed.replace('# ', '')}
            </h1>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          return (
            <div key={i} className="flex items-start gap-2 pl-2 text-zinc-300">
              <span className="text-cyan-400 mt-1.5 text-xs">•</span>
              <div>{renderInlineFormatting(trimmed.substring(2))}</div>
            </div>
          );
        }
        if (/^\d+\.\s/.test(trimmed)) {
          const num = trimmed.match(/^(\d+)\.\s/)?.[1];
          const rest = trimmed.replace(/^\d+\.\s/, '');
          return (
            <div key={i} className="flex items-start gap-2 pl-2 text-zinc-300">
              <span className="font-mono text-xs font-semibold text-cyan-400 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
                {num}
              </span>
              <div className="pt-0.5">{renderInlineFormatting(rest)}</div>
            </div>
          );
        }
        if (trimmed.startsWith('> ')) {
          return (
            <blockquote key={i} className="border-l-2 border-cyan-500/60 pl-3 py-1 my-2 bg-zinc-900/40 text-zinc-400 italic rounded-r text-xs">
              {renderInlineFormatting(trimmed.substring(2))}
            </blockquote>
          );
        }
        if (!trimmed) {
          return <div key={i} className="h-1.5" />;
        }

        return <p key={i} className="text-zinc-300 leading-relaxed">{renderInlineFormatting(line)}</p>;
      })}
    </div>
  );
};

// Fonction pour formater le gras, l'italique et le code en ligne `code`
function renderInlineFormatting(text: string): React.ReactNode {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      const code = part.slice(1, -1);
      return (
        <code
          key={index}
          className="font-mono text-xs px-1.5 py-0.5 rounded bg-zinc-800/90 text-cyan-300 border border-zinc-700/60 mx-0.5"
        >
          {code}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index} className="italic text-zinc-400">{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

interface MarkdownSegment {
  type: 'text' | 'code';
  text: string;
  language: string;
  code: string;
}

function parseMarkdown(content: string): MarkdownSegment[] {
  const segments: MarkdownSegment[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      segments.push({
        type: 'text',
        text: content.slice(lastIndex, match.index),
        language: '',
        code: '',
      });
    }

    segments.push({
      type: 'code',
      text: '',
      language: match[1] || 'bash',
      code: match[2],
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    segments.push({
      type: 'text',
      text: content.slice(lastIndex),
      language: '',
      code: '',
    });
  }

  return segments;
}
