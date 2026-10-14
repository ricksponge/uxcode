#!/usr/bin/env bash
# ==============================================================================
# OpenCode Web UI - Script de démarrage intelligent (Linux)
# Vérifie gen-local-proxy et OpenCode, puis lance le serveur et le navigateur
# ==============================================================================

PORT="${PORT:-3000}"
PROXY_URL="${PROXY_URL:-http://127.0.0.1:8080}"
INSTALL_DIR="${HOME}/.local/share/opencode-ui"

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m'

echo -e "${CYAN}${BOLD}[OpenCode Web UI]${NC} Initialisation du pont local..."

# 1. Vérification de gen-local-proxy
if pgrep -f "gen-local-proxy" > /dev/null 2>&1; then
    echo -e "${GREEN}[✓] gen-local-proxy est actif.${NC}"
elif curl -s --connect-timeout 1 "${PROXY_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}[✓] gen-local-proxy répond sur ${PROXY_URL}.${NC}"
else
    echo -e "${YELLOW}[!] Note : gen-local-proxy ne répond pas actuellement sur ${PROXY_URL}.${NC}"
    echo -e "${YELLOW}    L'interface fonctionnera et tentera la reconnexion automatique dès son lancement.${NC}"
fi

# 2. Vérification de opencode
if pgrep -f "opencode" > /dev/null 2>&1; then
    echo -e "${GREEN}[✓] OpenCode CLI est actif.${NC}"
else
    echo -e "${BLUE}[i] OpenCode n'est pas encore lancé (lancez 'opencode' si nécessaire).${NC}"
fi

# 3. Positionnement dans le dossier du projet
if [ -d "${INSTALL_DIR}" ]; then
    cd "${INSTALL_DIR}"
fi

# 4. Ouverture automatique du navigateur dans 1.5s
(
    sleep 1.5
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:${PORT}" >/dev/null 2>&1
    elif command -v sensible-browser >/dev/null 2>&1; then
        sensible-browser "http://localhost:${PORT}" >/dev/null 2>&1
    fi
) &

echo -e "${CYAN}[OpenCode Web UI] Serveur démarré sur http://localhost:${PORT}${NC}"
echo -e "${BLUE}[i] Appuyez sur Ctrl+C pour arrêter le serveur.${NC}"

# 5. Démarrage du serveur Node
npm run start
