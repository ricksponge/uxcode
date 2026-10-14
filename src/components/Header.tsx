import React from 'react';
import { 
  Terminal, 
  Activity, 
  Settings, 
  Download, 
  BookOpen, 
  RefreshCw,
  Cpu,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { SystemStatus } from '../types';

interface HeaderProps {
  status: SystemStatus | null;
  activeTab: 'chat' | 'installer' | 'guide' | 'config';
  setActiveTab: (tab: 'chat' | 'installer' | 'guide' | 'config') => void;
  onRefreshStatus: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeTab,
  setActiveTab,
  onRefreshStatus,
  isRefreshing,
}) => {
  const proxyOnline = status?.proxy.online;
  const opencodeOnline = status?.opencode.online;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/10 border border-cyan-500/30 flex items-center justify-center shadow-lg shadow-cyan-950/40">
            <Terminal className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-base tracking-tight font-mono">
                OpenCode<span className="text-cyan-400">.ui</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/60 uppercase">
                Linux Bridge
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Pont local pour <span className="text-zinc-300 font-mono">gen-local-proxy</span> & <span className="text-zinc-300 font-mono">opencode</span>
            </p>
          </div>
        </div>

        {/* Real-time Status Badges */}
        <div className="hidden md:flex items-center gap-2 bg-zinc-900/90 p-1.5 rounded-xl border border-zinc-800/90 text-xs">
          {/* Proxy Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              proxyOnline
                ? 'bg-emerald-950/40 border-emerald-800/50 text-emerald-300'
                : 'bg-amber-950/30 border-amber-800/40 text-amber-300'
            }`}
            title={`Proxy: ${status?.proxy.url || 'http://127.0.0.1:8080'} - ${status?.proxy.details || 'Inconnu'}`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                proxyOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`}
            />
            <span className="font-mono text-[11px] font-medium">gen-local-proxy</span>
            <span className="text-[10px] opacity-75">
              {proxyOnline ? `${status?.proxy.latency}ms` : 'Relais actif'}
            </span>
          </div>

          {/* OpenCode Status */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all ${
              opencodeOnline
                ? 'bg-cyan-950/40 border-cyan-800/50 text-cyan-300'
                : 'bg-zinc-800/60 border-zinc-700/50 text-zinc-400'
            }`}
            title={`OpenCode: ${status?.opencode.url || 'http://127.0.0.1:4096'}`}
          >
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="font-mono text-[11px] font-medium">OpenCode CLI</span>
            <span className="text-[10px] opacity-75">
              {opencodeOnline ? 'Connecté' : 'Prêt'}
            </span>
          </div>

          {/* Refresh button */}
          <button
            onClick={onRefreshStatus}
            disabled={isRefreshing}
            className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors disabled:opacity-50"
            title="Rafraîchir les statuts"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'chat'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Console</span>
          </button>

          <button
            onClick={() => setActiveTab('installer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all relative ${
              activeTab === 'installer'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Scripts Linux</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping absolute -top-0.5 -right-0.5" />
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'guide'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'config'
                ? 'bg-zinc-800 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">Config</span>
          </button>
        </div>
      </div>
    </header>
  );
};
