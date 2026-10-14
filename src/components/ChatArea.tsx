import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Terminal, 
  Trash2, 
  Sparkles, 
  Zap, 
  Bot, 
  User, 
  ShieldAlert, 
  Layers, 
  CornerDownLeft,
  Clock,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { ChatMessage, SystemStatus } from '../types';
import { MarkdownRenderer } from './MarkdownRenderer';

interface ChatAreaProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, model: string) => Promise<void>;
  onClearMessages: () => void;
  isLoading: boolean;
  status: SystemStatus | null;
  selectedModel: string;
  setSelectedModel: (m: string) => void;
}

const AVAILABLE_MODELS = [
  { id: 'opencode-v1', label: 'OpenCode Local Agent (défaut)' },
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash (via proxy)' },
  { id: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro (via proxy)' },
  { id: 'deepseek-coder', label: 'DeepSeek Coder (local)' },
  { id: 'qwen-2.5-coder', label: 'Qwen 2.5 Coder (local)' },
];

const SUGGESTIONS = [
  'Vérifier la connexion avec gen-local-proxy',
  'Comment installer et lancer le service systemd ?',
  'Générer un script Python pour requêter le proxy local',
  'Créer une fonction de veille automatique sous Linux',
];

export const ChatArea: React.FC<ChatAreaProps> = ({
  messages,
  onSendMessage,
  onClearMessages,
  isLoading,
  status,
  selectedModel,
  setSelectedModel,
}) => {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const text = input.trim();
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await onSendMessage(text, selectedModel);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 180)}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-6xl mx-auto w-full">
      {/* Top Bar / Model Selector & Status Notice */}
      <div className="px-4 py-2.5 border-b border-zinc-800/80 bg-zinc-950/60 backdrop-blur flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-zinc-400">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Moteur d&apos;inférence :</span>
          </div>

          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1 text-xs text-zinc-200 font-mono focus:outline-none focus:border-cyan-500"
          >
            {AVAILABLE_MODELS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-3">
          {status?.proxy.online ? (
            <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Proxy en direct ({status.proxy.latency}ms)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-amber-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Pont local actif</span>
            </div>
          )}

          {messages.length > 0 && (
            <button
              onClick={onClearMessages}
              className="text-zinc-500 hover:text-rose-400 p-1 rounded transition-colors"
              title="Effacer la conversation"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-12 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-950/50">
              <Terminal className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-xl font-bold text-white tracking-tight">
                Console OpenCode & gen-local-proxy
              </h2>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Interagissez avec votre agent de code local, testez les flux d&apos;inférence, générez des correctifs et inspectez le code avec rendu Markdown complet.
              </p>
            </div>

            {/* Quick Suggestions */}
            <div className="w-full pt-2">
              <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 mb-2">
                Suggestions de commandes & requêtes :
              </div>
              <div className="grid grid-cols-1 gap-2 text-left">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setInput(s);
                      if (textareaRef.current) textareaRef.current.focus();
                    }}
                    className="p-2.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-zinc-700 text-xs text-zinc-300 hover:text-white transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span className="font-mono">{s}</span>
                    <CornerDownLeft className="w-3.5 h-3.5 text-zinc-600 group-hover:text-cyan-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 md:gap-4 ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5 shadow-sm">
                  <Terminal className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-3xl rounded-2xl p-4 space-y-2 ${
                  msg.role === 'user'
                    ? 'bg-cyan-600/20 border border-cyan-500/30 text-white shadow-sm'
                    : 'bg-zinc-900/70 border border-zinc-800 text-zinc-200 shadow-md w-full'
                }`}
              >
                <div className="flex items-center justify-between gap-3 text-[11px] text-zinc-400 pb-1 border-b border-zinc-800/60 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-zinc-300">
                      {msg.role === 'user' ? 'Vous' : `OpenCode Agent`}
                    </span>
                    {msg.model && (
                      <span className="text-cyan-400 text-[10px]">[{msg.model}]</span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500">{msg.timestamp}</span>
                </div>

                <div className="pt-1">
                  {msg.role === 'user' ? (
                    <p className="text-sm font-sans whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <MarkdownRenderer content={msg.content} />
                  )}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-zinc-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Terminal className="w-4 h-4 animate-pulse" />
            </div>
            <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 max-w-lg space-y-2">
              <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Traitement du flux OpenCode / gen-local-proxy...</span>
              </div>
              <p className="text-xs text-zinc-400">
                Génération de la réponse, exécution des vérifications locales et mise en forme du code.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Bar */}
      <div className="p-3 md:p-4 bg-zinc-950 border-t border-zinc-800">
        <form onSubmit={handleSubmit} className="relative">
          <textarea
            ref={textareaRef}
            rows={2}
            value={input}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Posez une question, demandez du code ou testez le proxy (Entrée pour envoyer, Shift+Entrée pour saut de ligne)..."
            className="w-full bg-zinc-900/90 border border-zinc-800 rounded-xl px-4 py-3 pr-24 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 resize-none font-sans"
            disabled={isLoading}
          />
          <div className="absolute right-3 bottom-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-semibold text-xs flex items-center gap-1.5 transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-cyan-950/40"
            >
              <span>Envoyer</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[11px] font-mono text-zinc-500">
          <span>Raccourci : <kbd className="px-1 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">Entrée</kbd> pour valider</span>
          <span>OpenCode Linux Bridge v1.0</span>
        </div>
      </div>
    </div>
  );
};
