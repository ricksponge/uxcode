import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Configuration en mémoire avec valeurs par défaut
let serverConfig = {
  proxyUrl: process.env.PROXY_URL || 'http://127.0.0.1:8080',
  opencodeUrl: process.env.OPENCODE_URL || 'http://127.0.0.1:4096',
  defaultModel: 'opencode-v1',
  streamResponses: true,
  simulateIfOffline: true,
  autoReconnectInterval: 5000,
};

app.use(express.json());

// API: Vérification de l'état du proxy et d'OpenCode
app.get('/api/status', async (req: Request, res: Response) => {
  const startTime = Date.now();
  let proxyOnline = false;
  let proxyLatency = 0;
  let proxyDetails = 'Non joignable';

  let opencodeOnline = false;
  let opencodeLatency = 0;
  let opencodeDetails = 'Non joignable';

  // 1. Tester le proxy local
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const pStart = Date.now();
    const proxyRes = await fetch(`${serverConfig.proxyUrl}/health`, {
      signal: controller.signal,
    }).catch(async () => {
      // Fallback: tester la racine ou /v1/models
      return await fetch(`${serverConfig.proxyUrl}/v1/models`, {
        signal: controller.signal,
      });
    });
    clearTimeout(timeoutId);

    if (proxyRes && (proxyRes.ok || proxyRes.status === 404 || proxyRes.status === 401)) {
      proxyOnline = true;
      proxyLatency = Date.now() - pStart;
      proxyDetails = `Réponse HTTP ${proxyRes.status} (${proxyLatency}ms)`;
    }
  } catch (err: any) {
    proxyOnline = false;
    proxyDetails = err.name === 'AbortError' ? 'Délai dépassé (Timeout)' : (err.message || 'Connexion refusée');
  }

  // 2. Tester OpenCode local
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const oStart = Date.now();
    const ocRes = await fetch(`${serverConfig.opencodeUrl}/status`, {
      signal: controller.signal,
    }).catch(async () => {
      return await fetch(`${serverConfig.opencodeUrl}/`, {
        signal: controller.signal,
      });
    });
    clearTimeout(timeoutId);

    if (ocRes && (ocRes.ok || ocRes.status === 404 || ocRes.status === 401)) {
      opencodeOnline = true;
      opencodeLatency = Date.now() - oStart;
      opencodeDetails = `Réponse HTTP ${ocRes.status} (${opencodeLatency}ms)`;
    }
  } catch (err: any) {
    opencodeOnline = false;
    opencodeDetails = err.name === 'AbortError' ? 'Délai dépassé' : (err.message || 'Hors ligne');
  }

  const isLocalhost = req.hostname === 'localhost' || req.hostname === '127.0.0.1';

  res.json({
    timestamp: new Date().toISOString(),
    isLocalhost,
    proxy: {
      url: serverConfig.proxyUrl,
      online: proxyOnline,
      latency: proxyLatency,
      details: proxyDetails,
    },
    opencode: {
      url: serverConfig.opencodeUrl,
      online: opencodeOnline,
      latency: opencodeLatency,
      details: opencodeDetails,
    },
    config: serverConfig,
  });
});

// API: Récupérer la configuration
app.get('/api/config', (_req: Request, res: Response) => {
  res.json(serverConfig);
});

// API: Mettre à jour la configuration
app.post('/api/config', (req: Request, res: Response) => {
  const { proxyUrl, opencodeUrl, defaultModel, simulateIfOffline } = req.body;
  if (proxyUrl) serverConfig.proxyUrl = proxyUrl.trim();
  if (opencodeUrl) serverConfig.opencodeUrl = opencodeUrl.trim();
  if (defaultModel) serverConfig.defaultModel = defaultModel;
  if (typeof simulateIfOffline === 'boolean') serverConfig.simulateIfOffline = simulateIfOffline;

  res.json({ success: true, config: serverConfig });
});

// API: Dialogue / Completion avec OpenCode ou Proxy
app.post('/api/chat', async (req: Request, res: Response) => {
  const { messages, model, systemPrompt, forcedSimulated } = req.body;

  // Si on force le mode simulation ou si le proxy est inaccessible
  const shouldSimulate = forcedSimulated || serverConfig.simulateIfOffline;

  // Tenter d'abord la vraie transmission au proxy si pas forcé
  if (!forcedSimulated) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const proxyResponse = await fetch(`${serverConfig.proxyUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': req.headers.authorization || 'Bearer opencode-local',
        },
        body: JSON.stringify({
          model: model || serverConfig.defaultModel,
          messages: [
            ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
            ...(messages || []),
          ],
          stream: false,
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (proxyResponse.ok) {
        const data = await proxyResponse.json();
        return res.json({
          source: 'proxy',
          message: data.choices?.[0]?.message?.content || 'Pas de contenu retourné.',
          usage: data.usage || null,
        });
      }
    } catch (err) {
      // Ignorer l'erreur et basculer en mode agent simulation si autorisé
      if (!serverConfig.simulateIfOffline) {
        return res.status(503).json({
          error: 'Le proxy local gen-local-proxy est inaccessible.',
          details: String(err),
        });
      }
    }
  }

  // Mode Agent OpenCode Intelligent (Simulation dynamique locale)
  const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';
  const reply = generateOpenCodeAgentResponse(lastUserMessage, model || serverConfig.defaultModel);

  return res.json({
    source: 'opencode-agent-bridge',
    simulated: true,
    message: reply,
    timestamp: new Date().toISOString(),
  });
});

// API: Fournir les scripts Linux bruts pour `curl -sSL ... | bash`
app.get('/api/scripts/install.sh', (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, 'scripts', 'install.sh');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="install.sh"');
    return res.sendFile(filePath);
  }
  res.status(404).send('#!/bin/bash\necho "install.sh introuvable"');
});

app.get('/api/scripts/start-opencode-ui.sh', (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, 'scripts', 'start-opencode-ui.sh');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/x-shellscript; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="start-opencode-ui.sh"');
    return res.sendFile(filePath);
  }
  res.status(404).send('#!/bin/bash\necho "start-opencode-ui.sh introuvable"');
});

app.get('/api/scripts/opencode-ui.service', (_req: Request, res: Response) => {
  const filePath = path.join(__dirname, 'scripts', 'opencode-ui.service');
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    return res.sendFile(filePath);
  }
  res.status(404).send('[Unit]\nDescription=opencode-ui');
});

// API: Fournir l'arborescence et le code des fichiers pour inspection et export
app.get('/api/export/manifest', (_req: Request, res: Response) => {
  const files = [
    { path: 'package.json', type: 'config' },
    { path: 'tsconfig.json', type: 'config' },
    { path: 'vite.config.ts', type: 'config' },
    { path: 'index.html', type: 'frontend' },
    { path: 'server.ts', type: 'backend' },
    { path: 'src/main.tsx', type: 'frontend' },
    { path: 'src/App.tsx', type: 'frontend' },
    { path: 'src/index.css', type: 'style' },
    { path: 'scripts/install.sh', type: 'script', executable: true },
    { path: 'scripts/start-opencode-ui.sh', type: 'script', executable: true },
    { path: 'scripts/opencode-ui.service', type: 'service' },
  ];
  res.json({ files });
});

// Générateur de réponse réaliste pour l'agent OpenCode
function generateOpenCodeAgentResponse(prompt: string, model: string): string {
  const lower = prompt.toLowerCase();

  if (lower.includes('proxy') || lower.includes('connexion') || lower.includes('status') || lower.includes('statut')) {
    return `### ⚡ Analyse de l'état du pont local \`gen-local-proxy\` & \`opencode\`

Voici le statut courant de votre pipeline :
- **Pont local actif :** OpenCode Web UI écoute sur \`http://127.0.0.1:3000\`
- **Cible Proxy :** \`${serverConfig.proxyUrl}\`
- **Cible OpenCode :** \`${serverConfig.opencodeUrl}\`

Pour vous assurer que votre proxy reçoit bien les requêtes sous Linux, vous pouvez exécuter :
\`\`\`bash
# 1. Vérifier si le processus gen-local-proxy tourne
pgrep -fl gen-local-proxy

# 2. Tester la réponse locale du proxy
curl -i http://127.0.0.1:8080/health || curl -i http://127.0.0.1:8080/v1/models
\`\`\`

Dès que \`gen-local-proxy\` est démarré sur votre machine, l'indicateur de statut vert en haut à droite s'allumera automatiquement et vos requêtes transiteront en direct !`;
  }

  if (lower.includes('install') || lower.includes('déploi') || lower.includes('bash') || lower.includes('service')) {
    return `### 🚀 Déploiement automatisé sur votre machine Linux

Les scripts d'automatisation ont été générés pour votre environnement :

1. **\`install.sh\`** : Crée \`~/.local/share/opencode-ui\`, installe Node.js si absent, compile le projet, configure l'exécutable dans \`~/.local/bin/start-opencode-ui\` et génère le raccourci Bureau \`.desktop\`.
2. **\`start-opencode-ui.sh\`** : Vérifie l'état de \`gen-local-proxy\`, démarre le serveur et ouvre automatiquement votre navigateur (\`xdg-open\`).
3. **\`opencode-ui.service\`** : Service systemd utilisateur pour maintenir l'interface en arrière-plan sans bloquer un terminal.

#### Commande rapide d'exécution :
\`\`\`bash
chmod +x scripts/install.sh
./scripts/install.sh
\`\`\`

Vous pouvez également télécharger l'archive ZIP complète directement depuis l'onglet **"Scripts & Déploiement Linux"** ci-dessus.`;
  }

  if (lower.includes('code') || lower.includes('python') || lower.includes('fonction') || lower.includes('script') || lower.includes('docker') || lower.includes('fastapi')) {
    return `### 💻 Proposition de code - OpenCode [${model}]

Voici une implémentation optimisée répondant à votre demande :

\`\`\`python
#!/usr/bin/env python3
"""
OpenCode Local Worker - Traitement et liaison avec gen-local-proxy
"""
import os
import sys
import httpx
from typing import Dict, Any

PROXY_URL = os.getenv("GEN_LOCAL_PROXY_URL", "http://127.0.0.1:8080")

async def query_local_pipeline(prompt: str) -> Dict[str, Any]:
    """Interroge le proxy local configuré sur la machine."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        payload = {
            "model": "${model}",
            "messages": [{"role": "user", "content": prompt}],
            "temperature": 0.2
        }
        response = await client.post(f"{PROXY_URL}/v1/chat/completions", json=payload)
        response.raise_for_status()
        return response.json()

if __name__ == "__main__":
    print(f"[OpenCode] Prêt à communiquer avec {PROXY_URL}")
\`\`\`

#### Points forts :
- **Client asynchrone** avec gestion du timeout
- **Résilient** aux coupures locales de flux
- Compatible avec le protocole OpenAI / Gemini de \`gen-local-proxy\``;
  }

  // Réponse générale d'assistant développeur OpenCode
  return `### 🛠️ OpenCode Assistant [Modèle : \`${model}\`]

J'ai bien reçu votre instruction :
> *"${prompt}"*

Voici les actions recommandées et l'analyse de votre environnement :
1. **Liaison active :** Votre terminal peut piloter l'application via les scripts dans \`scripts/\`.
2. **Flux de travail :**
   - Étape 1 : \`gen-local-proxy\` (active le canal d'inférence sécurisé)
   - Étape 2 : \`opencode\` (génère et applique les patchs de code)
   - Étape 3 : **OpenCode Web UI** (visualise l'historique, les diffs et teste vos prompts)

Souhaitez-vous inspecter une commande spécifique, générer un patch git ou modifier la configuration des ports de votre proxy ?`;
}

// Configuration serveur Vite vs Production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[OpenCode Web UI] Serveur démarré avec succès sur http://0.0.0.0:${PORT}`);
    console.log(`[OpenCode Web UI] Proxy cible configuré sur : ${serverConfig.proxyUrl}`);
  });
}

startServer().catch((err) => {
  console.error('[OpenCode Web UI] Erreur lors du démarrage du serveur:', err);
  process.exit(1);
});
