import React, { useState } from 'react';
import JSZip from 'jszip';
import { 
  Download, 
  Copy, 
  Check, 
  Terminal, 
  FolderTree, 
  FileCode, 
  CheckCircle2, 
  Play, 
  ExternalLink,
  ShieldCheck,
  Server,
  Zap,
  ChevronRight
} from 'lucide-react';
import { PROJECT_FILES } from '../data/projectFiles';
import { MarkdownRenderer } from './MarkdownRenderer';

export const InstallerTab: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('scripts/install.sh');
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);

  const activeFile = PROJECT_FILES.find((f) => f.path === selectedFile) || PROJECT_FILES[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 2500);
  };

  const handleDownloadSingleFile = (fileName: string, content: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadFullZip = async () => {
    setIsGeneratingZip(true);
    try {
      const zip = new JSZip();

      // Ajouter tous les fichiers du projet
      PROJECT_FILES.forEach((file) => {
        zip.file(file.path, file.content);
      });

      // Ajouter un lanceur direct à la racine de l'archive
      zip.file(
        'install-linux.sh',
        `#!/usr/bin/env bash\ncd "$(dirname "$0")"\nchmod +x scripts/*.sh\n./scripts/install.sh\n`
      );

      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'opencode-ui-linux.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur lors de la création du zip:', err);
    } finally {
      setIsGeneratingZip(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 border border-zinc-800 p-6 md:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-800/50 text-cyan-400 text-xs font-mono">
              <Zap className="w-3.5 h-3.5" />
              <span>Automatisation Linux complète : install.sh & start-opencode-ui.sh</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Déploiement & Scripts Linux automatisés
            </h1>
            <p className="text-sm text-zinc-300 leading-relaxed">
              Installez OpenCode Web UI sur votre machine Linux en une seule commande. 
              Le script gère automatiquement l&apos;arborescence <code className="text-cyan-300 font-mono text-xs">~/.local/share/opencode-ui</code>, 
              le lanceur intelligent <code className="text-cyan-300 font-mono text-xs">start-opencode-ui</code> et le service d&apos;arrière-plan systemd.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-3">
            <button
              onClick={handleDownloadFullZip}
              disabled={isGeneratingZip}
              className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-semibold text-sm shadow-lg shadow-cyan-950/50 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              {zipSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-zinc-950" />
                  <span>Archive ZIP téléchargée !</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-zinc-950" />
                  <span>{isGeneratingZip ? 'Génération...' : 'Télécharger le Pack ZIP (.zip)'}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick 1-Command Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
              1
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Installation 1-clic</span>
          </div>
          <h3 className="font-semibold text-white text-sm">Exécuter l&apos;installateur</h3>
          <p className="text-xs text-zinc-400">
            Téléchargez l&apos;archive ou lancez directement le script d&apos;installation Bash.
          </p>
          <div className="bg-zinc-950 rounded-lg p-2.5 font-mono text-xs border border-zinc-800 flex items-center justify-between">
            <code className="text-cyan-300 truncate">./scripts/install.sh</code>
            <button
              onClick={() => handleCopy('./scripts/install.sh', 'step1')}
              className="text-zinc-400 hover:text-white ml-2 p-1 rounded"
              title="Copier"
            >
              {copiedCmd === 'step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 2 */}
        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
              2
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Lancement CLI</span>
          </div>
          <h3 className="font-semibold text-white text-sm">Démarrage interactif</h3>
          <p className="text-xs text-zinc-400">
            Vérifie <code className="text-zinc-300">gen-local-proxy</code>, démarre le pont et ouvre le navigateur.
          </p>
          <div className="bg-zinc-950 rounded-lg p-2.5 font-mono text-xs border border-zinc-800 flex items-center justify-between">
            <code className="text-cyan-300 truncate">start-opencode-ui</code>
            <button
              onClick={() => handleCopy('start-opencode-ui', 'step2')}
              className="text-zinc-400 hover:text-white ml-2 p-1 rounded"
              title="Copier"
            >
              {copiedCmd === 'step2' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Step 3 */}
        <div className="bg-zinc-900/60 rounded-xl border border-zinc-800 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="w-6 h-6 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-400 font-mono text-xs flex items-center justify-center font-bold">
              3
            </span>
            <span className="text-[11px] font-mono text-zinc-500">Service Linux</span>
          </div>
          <h3 className="font-semibold text-white text-sm">Service d&apos;arrière-plan</h3>
          <p className="text-xs text-zinc-400">
            Activer l&apos;exécution automatique au démarrage de votre session via systemd.
          </p>
          <div className="bg-zinc-950 rounded-lg p-2.5 font-mono text-xs border border-zinc-800 flex items-center justify-between">
            <code className="text-cyan-300 truncate text-[11px]">systemctl --user enable --now opencode-ui</code>
            <button
              onClick={() => handleCopy('systemctl --user enable --now opencode-ui', 'step3')}
              className="text-zinc-400 hover:text-white ml-2 p-1 rounded"
              title="Copier"
            >
              {copiedCmd === 'step3' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Code & Scripts Explorer */}
      <div className="bg-zinc-900/70 rounded-2xl border border-zinc-800 overflow-hidden shadow-xl">
        <div className="p-4 bg-zinc-900 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <FolderTree className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Explorateur du Code Source & Scripts</h2>
            <span className="text-xs text-zinc-500">({PROJECT_FILES.length} fichiers générés)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleDownloadSingleFile(activeFile.name, activeFile.content)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-zinc-400" />
              <span>Télécharger {activeFile.name}</span>
            </button>
            <button
              onClick={() => handleCopy(activeFile.content, 'active_content')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-800/50 text-xs text-cyan-300 transition-colors cursor-pointer"
            >
              {copiedCmd === 'active_content' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Code Copié</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le contenu</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[500px]">
          {/* File List Navigation */}
          <div className="lg:col-span-4 border-r border-zinc-800 bg-zinc-950/60 p-3 space-y-1">
            <div className="px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Fichiers d&apos;Automatisation & Scripts
            </div>
            {PROJECT_FILES.filter((f) => f.category === 'script' || f.category === 'service').map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file.path)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
                  selectedFile === file.path
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Terminal className={`w-3.5 h-3.5 ${selectedFile === file.path ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                {file.executable && (
                  <span className="text-[10px] px-1 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                    +x
                  </span>
                )}
              </button>
            ))}

            <div className="pt-3 px-2 py-1 text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold">
              Code Applicatif (Backend & Config)
            </div>
            {PROJECT_FILES.filter((f) => f.category !== 'script' && f.category !== 'service').map((file) => (
              <button
                key={file.path}
                onClick={() => setSelectedFile(file.path)}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-mono flex items-center justify-between transition-all ${
                  selectedFile === file.path
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 font-semibold'
                    : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileCode className={`w-3.5 h-3.5 ${selectedFile === file.path ? 'text-cyan-400' : 'text-zinc-500'}`} />
                  <span className="truncate">{file.path}</span>
                </div>
                <span className="text-[10px] text-zinc-600 uppercase">{file.category}</span>
              </button>
            ))}

            {/* Arborescence Visuelle */}
            <div className="mt-4 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800/80 text-[11px] font-mono text-zinc-400">
              <div className="text-zinc-300 font-semibold mb-1 flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
                Arborescence cible Linux :
              </div>
              <div className="leading-5 text-zinc-500">
                ~/.local/share/opencode-ui/<br />
                ├── scripts/<br />
                │   ├── install.sh<br />
                │   ├── start-opencode-ui.sh<br />
                │   └── opencode-ui.service<br />
                ├── server.ts<br />
                ├── package.json<br />
                └── dist/ (ou src/)
              </div>
            </div>
          </div>

          {/* File Content Preview */}
          <div className="lg:col-span-8 p-4 bg-zinc-950 overflow-y-auto max-h-[600px] flex flex-col">
            <div className="mb-3 pb-2 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-semibold">{activeFile.path}</span>
                <p className="text-xs text-zinc-400 mt-0.5">{activeFile.description}</p>
              </div>
            </div>

            <div className="flex-1 font-mono text-xs">
              <MarkdownRenderer
                content={`\`\`\`${activeFile.name.endsWith('.sh') ? 'bash' : activeFile.name.endsWith('.json') ? 'json' : activeFile.name.endsWith('.ts') ? 'typescript' : 'text'}\n${activeFile.content}\n\`\`\``}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
