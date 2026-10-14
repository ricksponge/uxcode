import { ProjectFile } from '../types';

export const PROJECT_FILES: ProjectFile[] = [
  {
    name: 'install.sh',
    path: 'scripts/install.sh',
    category: 'script',
    executable: true,
    description: 'Script Bash automatisé : prépare les dossiers, installe Node.js si besoin, compile et crée le service systemd.',
    content: `#!/usr/bin/env bash
# ==============================================================================
# OpenCode Web UI - Script d'installation automatique pour Linux
# Compatible avec : Ubuntu/Debian, Arch Linux, Fedora/RHEL, OpenSUSE
# ==============================================================================

set -e

RED='\\033[0;31m'
GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
BOLD='\\033[1m'
NC='\\033[0m'

INSTALL_DIR="\${HOME}/.local/share/opencode-ui"
BIN_DIR="\${HOME}/.local/bin"
SYSTEMD_USER_DIR="\${HOME}/.config/systemd/user"
APPLICATIONS_DIR="\${HOME}/.local/share/applications"

echo -e "\${CYAN}\${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          OPENCODE WEB UI - INSTALLATEUR LINUX AUTOMATIQUE        ║"
echo "║        Interface web locale pour gen-local-proxy & OpenCode      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "\${NC}"

echo -e "\${BLUE}[*] Étape 1/5 : Vérification de l'environnement Linux...\${NC}"

if ! command -v node >/dev/null 2>&1; then
    echo -e "\${YELLOW}[!] Node.js n'est pas détecté. Installation automatique...\${NC}"
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update && sudo apt-get install -y nodejs npm
    elif command -v pacman >/dev/null 2>&1; then
        sudo pacman -Sy --noconfirm nodejs npm
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y nodejs npm
    else
        echo -e "\${RED}[ERREUR] Gestionnaire non reconnu. Installez Node.js manuellement.\${NC}"
        exit 1
    fi
else
    echo -e "\${GREEN}[✓] Node.js détecté : \$(node -v)\${NC}"
fi

echo -e "\${BLUE}[*] Étape 2/5 : Création des dossiers locaux...\${NC}"
mkdir -p "\${INSTALL_DIR}"
mkdir -p "\${BIN_DIR}"
mkdir -p "\${SYSTEMD_USER_DIR}"
mkdir -p "\${APPLICATIONS_DIR}"

echo -e "\${BLUE}[*] Étape 3/5 : Copie des fichiers applicatifs...\${NC}"
SCRIPT_DIR="$(cd "$(dirname "\${BASH_SOURCE[0]}")/.." && pwd)"
if [ -f "\${SCRIPT_DIR}/package.json" ]; then
    cp -r "\${SCRIPT_DIR}"/* "\${INSTALL_DIR}/"
fi

cd "\${INSTALL_DIR}"

echo -e "\${BLUE}[*] Étape 4/5 : Installation des modules npm...\${NC}"
npm install --no-audit --no-fund
npm run build || true

echo -e "\${BLUE}[*] Étape 5/5 : Configuration du lanceur et service systemd...\${NC}"

# Création du script exécutable ~/.local/bin/start-opencode-ui
cat << 'EOF' > "\${BIN_DIR}/start-opencode-ui"
#!/usr/bin/env bash
INSTALL_DIR="\${HOME}/.local/share/opencode-ui"
PORT=3000

echo -e "\\033[1;36m[OpenCode UI]\\033[0m Démarrage..."

if ! pgrep -f "gen-local-proxy" > /dev/null 2>&1; then
    echo -e "\\033[1;33m[OpenCode UI] Info :\\033[0m Pensez à lancer 'gen-local-proxy' pour activer le flux proxy local."
fi

cd "\${INSTALL_DIR}"
(sleep 1.5 && (xdg-open "http://localhost:\${PORT}" || sensible-browser "http://localhost:\${PORT}") >/dev/null 2>&1) &
npm run start
EOF

chmod +x "\${BIN_DIR}/start-opencode-ui"
ln -sf "\${BIN_DIR}/start-opencode-ui" "\${BIN_DIR}/opencode-ui"

# Service systemd utilisateur
cat << EOF > "\${SYSTEMD_USER_DIR}/opencode-ui.service"
[Unit]
Description=OpenCode Web UI Service
After=network.target

[Service]
Type=simple
WorkingDirectory=\${INSTALL_DIR}
ExecStart=\$(which npm) run start
Restart=on-failure
RestartSec=3
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

# Entrée de bureau (.desktop)
cat << EOF > "\${APPLICATIONS_DIR}/opencode-ui.desktop"
[Desktop Entry]
Name=OpenCode Web UI
Comment=Interface locale pour OpenCode et gen-local-proxy
Exec=\${BIN_DIR}/start-opencode-ui
Icon=utilities-terminal
Terminal=true
Type=Application
Categories=Development;Utility;
EOF

chmod +x "\${APPLICATIONS_DIR}/opencode-ui.desktop"

# Vérification du PATH
if [[ ":$PATH:" != *":\${HOME}/.local/bin:"* ]]; then
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "\${HOME}/.bashrc"
    export PATH="\$HOME/.local/bin:\$PATH"
fi

echo ""
echo -e "\${GREEN}\${BOLD}INSTALLATION TERMINÉE AVEC SUCCÈS !\${NC}"
echo -e "Pour lancer l'application :"
echo -e "  \${CYAN}\${BOLD}start-opencode-ui\${NC}   (ou   \${CYAN}\${BOLD}opencode-ui\${NC})"
echo -e "Pour activer en arrière-plan :"
echo -e "  \${CYAN}systemctl --user enable --now opencode-ui\${NC}"
echo -e "Accès Web : \${BOLD}http://localhost:3000\${NC}"
`,
  },
  {
    name: 'start-opencode-ui.sh',
    path: 'scripts/start-opencode-ui.sh',
    category: 'script',
    executable: true,
    description: 'Script de lancement intelligent : vérifie les processus gen-local-proxy et opencode, lance le serveur et ouvre le navigateur.',
    content: `#!/usr/bin/env bash
PORT="\${PORT:-3000}"
PROXY_URL="\${PROXY_URL:-http://127.0.0.1:8080}"
INSTALL_DIR="\${HOME}/.local/share/opencode-ui"

GREEN='\\033[0;32m'
BLUE='\\033[0;34m'
YELLOW='\\033[1;33m'
CYAN='\\033[0;36m'
BOLD='\\033[1m'
NC='\\033[0m'

echo -e "\${CYAN}\${BOLD}[OpenCode Web UI]\${NC} Initialisation du pont local..."

# Vérification du statut de gen-local-proxy
if pgrep -f "gen-local-proxy" > /dev/null 2>&1; then
    echo -e "\${GREEN}[✓] gen-local-proxy est actif.\${NC}"
elif curl -s --connect-timeout 1 "\${PROXY_URL}" > /dev/null 2>&1; then
    echo -e "\${GREEN}[✓] gen-local-proxy répond sur \${PROXY_URL}.\${NC}"
else
    echo -e "\${YELLOW}[!] Note : gen-local-proxy ne répond pas sur \${PROXY_URL}.\${NC}"
    echo -e "\${YELLOW}    Lancez 'gen-local-proxy' dans un autre terminal si vous souhaitez le flux direct.\${NC}"
fi

# Vérification de opencode CLI
if pgrep -f "opencode" > /dev/null 2>&1; then
    echo -e "\${GREEN}[✓] OpenCode CLI est actif.\${NC}"
else
    echo -e "\${BLUE}[i] OpenCode n'est pas encore lancé.\${NC}"
fi

if [ -d "\${INSTALL_DIR}" ]; then
    cd "\${INSTALL_DIR}"
fi

# Ouverture automatique du navigateur par défaut
(
    sleep 1.5
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:\${PORT}" >/dev/null 2>&1
    elif command -v sensible-browser >/dev/null 2>&1; then
        sensible-browser "http://localhost:\${PORT}" >/dev/null 2>&1
    fi
) &

echo -e "\${CYAN}[OpenCode Web UI] Serveur démarré sur http://localhost:\${PORT}\${NC}"
npm run start
`,
  },
  {
    name: 'opencode-ui.service',
    path: 'scripts/opencode-ui.service',
    category: 'service',
    description: 'Unité systemd utilisateur pour maintenir le pont web actif en tâche de fond.',
    content: `[Unit]
Description=OpenCode Web UI - Interface locale pour gen-local-proxy et opencode
After=network.target

[Service]
Type=simple
WorkingDirectory=%h/.local/share/opencode-ui
ExecStart=/usr/bin/env npm run start
Restart=always
RestartSec=5
Environment=PORT=3000
Environment=NODE_ENV=production
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=default.target
`,
  },
  {
    name: 'server.ts',
    path: 'server.ts',
    category: 'backend',
    description: 'Serveur Express & pont proxy local avec endpoints de vérification d’état, streaming et distribution de scripts.',
    content: `import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
let proxyUrl = process.env.PROXY_URL || 'http://127.0.0.1:8080';
let opencodeUrl = process.env.OPENCODE_URL || 'http://127.0.0.1:4096';

app.use(express.json());

// Endpoints /api/status, /api/chat, /api/config, /api/scripts/...
// Voir le fichier complet dans le projet.
`,
  },
  {
    name: 'package.json',
    path: 'package.json',
    category: 'config',
    description: 'Dépendances Node.js, scripts de démarrage dev/start/build.',
    content: `{
  "name": "opencode-web-ui",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "tsx server.ts",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "express": "^4.21.2",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "jszip": "^3.10.1",
    "dotenv": "^17.2.3"
  },
  "devDependencies": {
    "typescript": "^7.0.2",
    "tsx": "^4.21.0",
    "vite": "^8.3.0",
    "@tailwindcss/vite": "^4.3.3",
    "tailwindcss": "^4.3.3"
  }
}`,
  },
  {
    name: 'README-LINUX.md',
    path: 'scripts/README-LINUX.md',
    category: 'doc',
    description: 'Guide complet pour exécuter le proxy, OpenCode et l’interface sur Linux.',
    content: `# Guide d'installation et d'utilisation OpenCode Web UI sur Linux
Consultez l'onglet Guide & Déploiement pour les commandes pas-à-pas.`,
  },
];
