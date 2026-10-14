# Guide d'installation et d'utilisation - OpenCode Web UI sur Linux

Ce projet fournit une interface web moderne (type IDE/Chat) et un pont local pour interagir avec **OpenCode** et **`gen-local-proxy`** sous Linux.

---

## ⚡ Flux de travail (Workflow)

```
[ gen-local-proxy ]  ──(Port 8080)──┐
                                     ├──> [ OpenCode Web UI (Port 3000) ] <──> Navigateur Web
[ opencode CLI ]    ──(Port 4096)──┘
```

1. **Terminal 1 :** Lancez `gen-local-proxy`
2. **Terminal 2 :** Lancez `opencode`
3. **OpenCode Web UI :** Visualisez les statuts en direct, conversez avec l'agent, testez vos prompts et consultez les blocs de code avec coloration syntaxique.

---

## 🚀 Méthode 1 : Installation automatique en 1 ligne

Exécutez cette commande dans votre terminal :

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

### Ce que fait ce script :
- Vérifie et installe Node.js et npm si nécessaire (supporte `apt`, `pacman`, `dnf`).
- Installe l'application dans `~/.local/share/opencode-ui`.
- Crée la commande globale `start-opencode-ui` (et son alias `opencode-ui`) dans `~/.local/bin/`.
- Configure un service utilisateur **systemd** (`opencode-ui.service`).
- Crée un raccourci Bureau `.desktop`.

---

## 🖥️ Méthode 2 : Lancement manuel

```bash
# 1. Démarrer le lanceur intelligent
start-opencode-ui
# ou
./scripts/start-opencode-ui.sh
```

Le script vérifie automatiquement la présence de `gen-local-proxy`, démarre l'application et ouvre votre navigateur par défaut (`http://localhost:3000`).

---

## ⚙️ Service systemd (Exécution en arrière-plan permanente)

Pour que l'interface tourne automatiquement au démarrage de votre session Linux :

```bash
# Recharger la configuration systemd utilisateur
systemctl --user daemon-reload

# Activer et démarrer le service
systemctl --user enable --now opencode-ui

# Consulter les logs en temps réel
journalctl --user -u opencode-ui -f
```

Pour arrêter le service :
```bash
systemctl --user stop opencode-ui
```

---

## 📂 Arborescence des fichiers du projet

```
opencode-ui/
├── package.json               # Dépendances et scripts de démarrage
├── tsconfig.json              # Configuration TypeScript
├── vite.config.ts             # Configuration Vite & Tailwind
├── index.html                 # Point d'entrée HTML
├── server.ts                  # Serveur Express (Pont proxy & API de statut)
├── src/
│   ├── main.tsx               # Point d'entrée React
│   ├── App.tsx                # Interface principale (Chat, Statut, Scripts)
│   ├── index.css              # Styles Tailwind CSS v4
│   ├── types/                 # Types TypeScript (messages, proxy status)
│   └── components/            # Composants modulaires (Chat, CodeBlock, etc.)
└── scripts/
    ├── install.sh             # Script d'installation automatique Linux
    ├── start-opencode-ui.sh   # Script de lancement avec vérification du proxy
    ├── opencode-ui.service    # Fichier de service systemd utilisateur
    └── README-LINUX.md        # Documentation complète
```
