#!/usr/bin/env bash
# ==============================================================================
# OpenCode Web UI - Script d'installation automatique pour Linux
# Compatible avec : Ubuntu/Debian, Arch Linux, Fedora/RHEL, OpenSUSE
# ==============================================================================

set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

INSTALL_DIR="${HOME}/.local/share/opencode-ui"
BIN_DIR="${HOME}/.local/bin"
SYSTEMD_USER_DIR="${HOME}/.config/systemd/user"
APPLICATIONS_DIR="${HOME}/.local/share/applications"

echo -e "${CYAN}${BOLD}"
echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║          OPENCODE WEB UI - INSTALLATEUR LINUX AUTOMATIQUE        ║"
echo "║        Interface web locale pour gen-local-proxy & OpenCode      ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

echo -e "${BLUE}[*] Étape 1/5 : Vérification de l'environnement Linux...${NC}"

# Vérifier la présence de Node.js et npm
if ! command -v node >/dev/null 2>&1; then
    echo -e "${YELLOW}[!] Node.js n'est pas détecté sur votre système.${NC}"
    echo -e "${YELLOW}[!] Tentative de détection du gestionnaire de paquets...${NC}"
    if command -v apt-get >/dev/null 2>&1; then
        echo -e "${CYAN}Détection de apt (Debian/Ubuntu). Installation de Node.js...${NC}"
        sudo apt-get update && sudo apt-get install -y nodejs npm
    elif command -v pacman >/dev/null 2>&1; then
        echo -e "${CYAN}Détection de pacman (Arch Linux). Installation de Node.js...${NC}"
        sudo pacman -Sy --noconfirm nodejs npm
    elif command -v dnf >/dev/null 2>&1; then
        echo -e "${CYAN}Détection de dnf (Fedora). Installation de Node.js...${NC}"
        sudo dnf install -y nodejs npm
    else
        echo -e "${RED}[ERREUR] Gestionnaire de paquets non reconnu. Veuillez installer Node.js (v18+) manuellement.${NC}"
        exit 1
    fi
else
    NODE_VER=$(node -v)
    echo -e "${GREEN}[✓] Node.js détecté : ${NODE_VER}${NC}"
fi

# Création des répertoires nécessaires
echo -e "${BLUE}[*] Étape 2/5 : Préparation des répertoires locaux...${NC}"
mkdir -p "${INSTALL_DIR}"
mkdir -p "${BIN_DIR}"
mkdir -p "${SYSTEMD_USER_DIR}"
mkdir -p "${APPLICATIONS_DIR}"

# Déterminer la source des fichiers (si le script est lancé depuis le dossier décompressé)
SCRIPT_SOURCE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo -e "${BLUE}[*] Étape 3/5 : Copie des fichiers vers ${INSTALL_DIR}...${NC}"

if [ -f "${SCRIPT_SOURCE_DIR}/package.json" ]; then
    # Copie depuis le dossier courant
    cp -r "${SCRIPT_SOURCE_DIR}"/* "${INSTALL_DIR}/"
else
    echo -e "${YELLOW}[!] Le dossier courant ne contient pas package.json.${NC}"
    echo -e "${YELLOW}[!] Clonage ou téléchargement des fichiers sources...${NC}"
fi

cd "${INSTALL_DIR}"

echo -e "${BLUE}[*] Étape 4/5 : Installation des dépendances et compilation...${NC}"
npm install --no-audit --no-fund
npm run build || true

# Création du script de lancement dans ~/.local/bin/start-opencode-ui
echo -e "${BLUE}[*] Étape 5/5 : Configuration du lanceur et service systemd...${NC}"

cat << 'EOF' > "${BIN_DIR}/start-opencode-ui"
#!/usr/bin/env bash
# Lanceur OpenCode Web UI
INSTALL_DIR="${HOME}/.local/share/opencode-ui"
PORT=3000

echo -e "\033[1;36m[OpenCode UI]\033[0m Démarrage de l'application..."

# Vérifier si gen-local-proxy est actif
if ! pgrep -f "gen-local-proxy" > /dev/null 2>&1; then
    echo -e "\033[1;33m[OpenCode UI] Attention :\033[0m gen-local-proxy ne semble pas être lancé."
    echo -e "\033[1;33m[OpenCode UI]\033[0m Pensez à lancer 'gen-local-proxy' dans un terminal séparé si vous souhaitez vous connecter au proxy local."
fi

# Vérifier si opencode est actif
if ! pgrep -f "opencode" > /dev/null 2>&1; then
    echo -e "\033[1;33m[OpenCode UI] Info :\033[0m opencode CLI n'est pas encore en cours d'exécution."
fi

cd "${INSTALL_DIR}"
# Ouvrir le navigateur dans 1.5s
(sleep 2 && (xdg-open "http://localhost:${PORT}" || sensible-browser "http://localhost:${PORT}") >/dev/null 2>&1) &

# Lancer le serveur
npm run start
EOF

chmod +x "${BIN_DIR}/start-opencode-ui"
# Alias court 'opencode-ui'
ln -sf "${BIN_DIR}/start-opencode-ui" "${BIN_DIR}/opencode-ui"

# Création du service systemd utilisateur
cat << EOF > "${SYSTEMD_USER_DIR}/opencode-ui.service"
[Unit]
Description=OpenCode Web UI & gen-local-proxy Bridge
After=network.target

[Service]
Type=simple
WorkingDirectory=${INSTALL_DIR}
ExecStart=$(which npm) run start
Restart=on-failure
RestartSec=3
Environment=PORT=3000
Environment=NODE_ENV=production

[Install]
WantedBy=default.target
EOF

# Création du raccourci Bureau (.desktop)
cat << EOF > "${APPLICATIONS_DIR}/opencode-ui.desktop"
[Desktop Entry]
Name=OpenCode Web UI
Comment=Interface locale pour OpenCode et gen-local-proxy
Exec=${BIN_DIR}/start-opencode-ui
Icon=utilities-terminal
Terminal=true
Type=Application
Categories=Development;Utility;
Keywords=opencode;proxy;ai;code;
EOF

chmod +x "${APPLICATIONS_DIR}/opencode-ui.desktop"

# S'assurer que ~/.local/bin est dans le PATH de l'utilisateur
if [[ ":$PATH:" != *":${HOME}/.local/bin:"* ]]; then
    echo -e "${YELLOW}[!] Ajout de ${HOME}/.local/bin à votre ~/.bashrc...${NC}"
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "${HOME}/.bashrc"
    export PATH="$HOME/.local/bin:$PATH"
fi

echo ""
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}${BOLD}       INSTALLATION TERMINÉE AVEC SUCCÈS !                       ${NC}"
echo -e "${GREEN}${BOLD}══════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "Pour démarrer OpenCode Web UI, utilisez simplement :"
echo -e "  ${CYAN}${BOLD}start-opencode-ui${NC}  (ou  ${CYAN}${BOLD}opencode-ui${NC})"
echo ""
echo -e "Pour l'exécuter en arrière-plan en continu via systemd :"
echo -e "  ${CYAN}systemctl --user daemon-reload${NC}"
echo -e "  ${CYAN}systemctl --user enable --now opencode-ui${NC}"
echo ""
echo -e "Accès Web : ${BOLD}http://localhost:3000${NC}"
echo ""
