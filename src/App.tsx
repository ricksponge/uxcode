import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { ChatArea } from './components/ChatArea';
import { InstallerTab } from './components/InstallerTab';
import { GuideTab } from './components/GuideTab';
import { ConfigTab } from './components/ConfigTab';
import { SystemStatus, ChatMessage } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'chat' | 'installer' | 'guide' | 'config'>('chat');
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('opencode-v1');

  // Historique de chat initial
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `### 👋 Bienvenue sur OpenCode Web UI & Linux Bridge

Cette interface web locale fait office de pont direct avec vos outils installés sur votre machine Linux :
- **gen-local-proxy** : Pont d'authentification et d'inférence (par défaut sur \`http://127.0.0.1:8080\`)
- **OpenCode CLI** : Outil d'assistance et de modification de code source
- **Automatisation Linux** : Scripts Bash \`install.sh\` et \`start-opencode-ui.sh\` prêts à l'emploi

> 💡 **Déploiement rapide :** Rendez-vous sur l'onglet **"Scripts Linux"** en haut à droite pour télécharger l'archive ZIP ou copier la commande d'installation automatique en une ligne !`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'opencode-agent-bridge',
      model: 'opencode-v1',
    },
  ]);

  // Fonction pour sonder l'état du proxy et d'OpenCode
  const fetchStatus = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/status');
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (err) {
      console.warn('Impossible de joindre /api/status:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  // Polling automatique toutes les 8 secondes
  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, [fetchStatus]);

  // Envoi d'un message
  const handleSendMessage = async (text: string, model: string) => {
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [...messages, userMessage];
    setMessages(updated);
    setIsLoadingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
          model,
        }),
      });

      if (!res.ok) {
        throw new Error(`Erreur HTTP: ${res.status}`);
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.message || 'Aucune réponse reçue.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        model: model,
        simulated: data.simulated,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ **Erreur lors de la communication :** ${err.message || 'Impossible de joindre le pont.'}\n\nVérifiez que le serveur ou que votre proxy local est bien en cours d'exécution.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'system',
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  const handleUpdateConfig = async (newConfig: {
    proxyUrl: string;
    opencodeUrl: string;
    defaultModel: string;
    simulateIfOffline: boolean;
  }) => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      await fetchStatus();
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la configuration:', err);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header
        status={status}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshStatus={fetchStatus}
        isRefreshing={isRefreshing}
      />

      <main className="flex-1 flex flex-col overflow-x-hidden">
        {activeTab === 'chat' && (
          <ChatArea
            messages={messages}
            onSendMessage={handleSendMessage}
            onClearMessages={handleClearMessages}
            isLoading={isLoadingChat}
            status={status}
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
          />
        )}

        {activeTab === 'installer' && <InstallerTab />}

        {activeTab === 'guide' && <GuideTab />}

        {activeTab === 'config' && (
          <ConfigTab
            status={status}
            onUpdateConfig={handleUpdateConfig}
            onTestConnection={fetchStatus}
            isTesting={isRefreshing}
          />
        )}
      </main>
    </div>
  );
}
