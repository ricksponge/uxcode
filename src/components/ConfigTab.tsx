import React, { useState } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Check, 
  Server, 
  Shield, 
  Cpu, 
  Activity, 
  CheckCircle2, 
  XCircle,
  ExternalLink
} from 'lucide-react';
import { SystemStatus } from '../types';

interface ConfigTabProps {
  status: SystemStatus | null;
  onUpdateConfig: (newConfig: { proxyUrl: string; opencodeUrl: string; defaultModel: string; simulateIfOffline: boolean }) => Promise<void>;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  status,
  onUpdateConfig,
  onTestConnection,
  isTesting,
}) => {
  const [proxyUrl, setProxyUrl] = useState(status?.config.proxyUrl || 'http://127.0.0.1:8080');
  const [opencodeUrl, setOpencodeUrl] = useState(status?.config.opencodeUrl || 'http://127.0.0.1:4096');
  const [defaultModel, setDefaultModel] = useState(status?.config.defaultModel || 'opencode-v1');
  const [simulateIfOffline, setSimulateIfOffline] = useState(status?.config.simulateIfOffline ?? true);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await onUpdateConfig({
      proxyUrl,
      opencodeUrl,
      defaultModel,
      simulateIfOffline,
    });
    setIsSaving(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          Paramètres du pont local & Endpoints
        </h1>
        <p className="text-sm text-zinc-400">
          Ajustez les adresses IP et ports d&apos;écoute de <code className="text-cyan-300 font-mono text-xs">gen-local-proxy</code> et <code className="text-cyan-300 font-mono text-xs">opencode</code>.
        </p>
      </div>

      {/* Real-time Status Card */}
      <div className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">Diagnostic de Connectivité Locale</h2>
          </div>
          <button
            onClick={onTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-200 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin text-cyan-400' : ''}`} />
            <span>Tester la connexion</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Proxy Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-zinc-300">gen-local-proxy</span>
              {status?.proxy.online ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> Connecté
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-400">
                  <XCircle className="w-3 h-3 text-amber-400" /> Relais actif
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-cyan-400 truncate">{status?.proxy.url}</div>
            <div className="text-[11px] text-zinc-500">{status?.proxy.details}</div>
          </div>

          {/* OpenCode Box */}
          <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-zinc-300">OpenCode Agent</span>
              {status?.opencode.online ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                  <CheckCircle2 className="w-3 h-3" /> En ligne
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-800 text-zinc-400">
                  Prêt
                </span>
              )}
            </div>
            <div className="text-xs font-mono text-cyan-400 truncate">{status?.opencode.url}</div>
            <div className="text-[11px] text-zinc-500">{status?.opencode.details}</div>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="p-5 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-5">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Settings className="w-4 h-4 text-cyan-400" />
          Configuration des Ports & Cibles
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              URL de gen-local-proxy
            </label>
            <input
              type="text"
              value={proxyUrl}
              onChange={(e) => setProxyUrl(e.target.value)}
              placeholder="http://127.0.0.1:8080"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Port par défaut de gen-local-proxy : 8080 (ou 8000 selon vos options CLI).
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              URL du service OpenCode
            </label>
            <input
              type="text"
              value={opencodeUrl}
              onChange={(e) => setOpencodeUrl(e.target.value)}
              placeholder="http://127.0.0.1:4096"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
            <p className="text-[11px] text-zinc-500 mt-1">
              Port de contrôle local de l&apos;agent OpenCode (par défaut 4096).
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-zinc-300 mb-1.5">
              Modèle d&apos;inférence par défaut
            </label>
            <input
              type="text"
              value={defaultModel}
              onChange={(e) => setDefaultModel(e.target.value)}
              placeholder="opencode-v1"
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-100 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-zinc-800/80">
            <div>
              <div className="text-xs font-medium text-zinc-200">Mode Relais / Simulation intelligente</div>
              <div className="text-[11px] text-zinc-400">
                Génère des réponses d&apos;agent et des blocs de code même si gen-local-proxy n&apos;est pas encore lancé.
              </div>
            </div>
            <input
              type="checkbox"
              checked={simulateIfOffline}
              onChange={(e) => setSimulateIfOffline(e.target.checked)}
              className="w-4 h-4 accent-cyan-500 rounded cursor-pointer"
            />
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-zinc-950 font-semibold text-xs transition-all shadow-md shadow-cyan-950/40 cursor-pointer disabled:opacity-50"
          >
            {savedSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-zinc-950" />
                <span>Paramètres enregistrés !</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-zinc-950" />
                <span>Enregistrer la configuration</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
