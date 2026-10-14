export interface ServiceStatus {
  url: string;
  online: boolean;
  latency: number;
  details: string;
}

export interface SystemStatus {
  timestamp: string;
  isLocalhost: boolean;
  proxy: ServiceStatus;
  opencode: ServiceStatus;
  config: {
    proxyUrl: string;
    opencodeUrl: string;
    defaultModel: string;
    simulateIfOffline: boolean;
    autoReconnectInterval: number;
  };
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  source?: 'proxy' | 'opencode-agent-bridge' | 'system';
  model?: string;
  simulated?: boolean;
}

export interface ProjectFile {
  name: string;
  path: string;
  category: 'script' | 'config' | 'backend' | 'frontend' | 'doc' | 'service';
  description: string;
  content: string;
  executable?: boolean;
}
