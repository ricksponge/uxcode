import React, { useState } from 'react';
import { 
  Terminal, 
  Layers, 
  HelpCircle, 
  CheckCircle, 
  Copy, 
  Check, 
  ArrowRight, 
  Settings2, 
  Cpu, 
  Zap,
  ShieldAlert
} from 'lucide-react';

export const GuideTab: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-8">
      {/* Introduction */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Guide d&apos;installation & Workflow CLI sous Linux
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Comprenez comment s&apos;articulent votre terminal Linux, le binaire <code className="text-cyan-300 font-mono">gen-local-proxy</code>, la CLI <code className="text-cyan-300 font-mono">opencode</code> et cette interface web.
        </p>
      </div>

      {/* Architecture Diagram */}
      <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Architecture & Flux de communication
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-cyan-400">
              <span className="font-bold">1. gen-local-proxy</span>
              <span className="text-[10px] bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800/40">:8080</span>
            </div>
            <p className="text-zinc-400 font-sans text-xs">
              Maintient le tunnel d&apos;authentification et expose les endpoints OpenAI/Gemini locaux.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-blue-400">
              <span className="font-bold">2. opencode CLI</span>
              <span className="text-[10px] bg-blue-950 px-1.5 py-0.5 rounded border border-blue-800/40">:4096</span>
            </div>
            <p className="text-zinc-400 font-sans text-xs">
              Agent autonome pour l&apos;application de diffs et la navigation dans le code source de vos projets.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between text-emerald-400">
              <span className="font-bold">3. OpenCode Web UI</span>
              <span className="text-[10px] bg-emerald-950 px-1.5 py-0.5 rounded border border-emerald-800/40">:3000</span>
            </div>
            <p className="text-zinc-400 font-sans text-xs">
              Pont local Express + Interface React moderne pour piloter, visualiser et tester vos prompts.
            </p>
          </div>
        </div>
      </div>

      {/* Step by Step Guide */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-white">Instructions pas-à-pas pour Linux</h2>

        {/* Step 1 */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-semibold text-white">Copier le projet sur votre machine Linux</h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Vous pouvez soit télécharger l&apos;archive ZIP depuis l&apos;onglet <strong>Scripts Linux</strong>, soit créer le dossier et coller les scripts manuellement :
          </p>

          <div className="bg-zinc-950 rounded-xl p-3 font-mono text-xs border border-zinc-800 relative group">
            <pre className="text-zinc-300 leading-5">
{`# Extraire l'archive téléchargée (opencode-ui-linux.zip)
unzip opencode-ui-linux.zip -d ~/opencode-ui
cd ~/opencode-ui`}
            </pre>
            <button
              onClick={() => handleCopy(`unzip opencode-ui-linux.zip -d ~/opencode-ui\ncd ~/opencode-ui`, 'cmd1')}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
            >
              {copiedSection === 'cmd1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-semibold text-white">Exécuter le script d&apos;installation automatique</h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Le script <code className="text-cyan-300 font-mono text-xs">install.sh</code> vérifie Node.js, installe les dépendances, configure <code className="text-zinc-300 font-mono text-xs">~/.local/bin/start-opencode-ui</code> et crée le service systemd :
          </p>

          <div className="bg-zinc-950 rounded-xl p-3 font-mono text-xs border border-zinc-800 relative group">
            <pre className="text-zinc-300 leading-5">
{`chmod +x scripts/install.sh
./scripts/install.sh`}
            </pre>
            <button
              onClick={() => handleCopy(`chmod +x scripts/install.sh\n./scripts/install.sh`, 'cmd2')}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
            >
              {copiedSection === 'cmd2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-semibold text-white">Votre routine quotidienne en CLI</h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Pour travailler efficacement avec vos outils :
          </p>

          <div className="bg-zinc-950 rounded-xl p-3 font-mono text-xs border border-zinc-800 relative group">
            <pre className="text-zinc-300 leading-5">
{`# 1. Dans le Terminal 1 :
gen-local-proxy

# 2. Dans le Terminal 2 :
opencode

# 3. Dans le Terminal 3 (ou exécuté automatiquement via systemd) :
start-opencode-ui`}
            </pre>
            <button
              onClick={() => handleCopy(`gen-local-proxy\nopencode\nstart-opencode-ui`, 'cmd3')}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
            >
              {copiedSection === 'cmd3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 font-mono text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-semibold text-white">Gestion du service en arrière-plan (systemd)</h3>
            </div>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Si vous préférez que l&apos;interface tourne en tâche de fond sans occuper de terminal :
          </p>

          <div className="bg-zinc-950 rounded-xl p-3 font-mono text-xs border border-zinc-800 relative group">
            <pre className="text-zinc-300 leading-5">
{`# Démarrer le service immédiatement et au boot
systemctl --user daemon-reload
systemctl --user enable --now opencode-ui

# Vérifier l'état du service
systemctl --user status opencode-ui

# Consulter les journaux en direct
journalctl --user -u opencode-ui -f`}
            </pre>
            <button
              onClick={() => handleCopy(`systemctl --user enable --now opencode-ui\nsystemctl --user status opencode-ui`, 'cmd4')}
              className="absolute right-3 top-3 p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
            >
              {copiedSection === 'cmd4' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Dépannage */}
      <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          Dépannage & Bonnes pratiques
        </h3>
        <ul className="text-xs text-zinc-400 space-y-2 list-disc list-inside">
          <li>
            <strong className="text-zinc-300">Port 3000 déjà utilisé :</strong> Vous pouvez changer le port lors du lancement via <code className="text-cyan-300 font-mono">PORT=3001 start-opencode-ui</code>.
          </li>
          <li>
            <strong className="text-zinc-300">Proxy sur un port différent :</strong> Si votre <code className="text-zinc-300 font-mono">gen-local-proxy</code> tourne sur le port 8000 au lieu de 8080, vous pouvez modifier l&apos;URL dans l&apos;onglet <strong>Config</strong> ou définir <code className="text-cyan-300 font-mono">PROXY_URL=http://127.0.0.1:8000</code>.
          </li>
          <li>
            <strong className="text-zinc-300">Permission refusée lors de l&apos;exécution :</strong> Vérifiez les droits exécutables avec <code className="text-cyan-300 font-mono">chmod +x scripts/*.sh</code>.
          </li>
        </ul>
      </div>
    </div>
  );
};
