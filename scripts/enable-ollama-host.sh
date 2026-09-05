#!/usr/bin/env bash
set -euo pipefail

# Run this on the Ubuntu host as the server administrator.
# It keeps Ollama native on Ubuntu and makes it reachable only through
# the private Tailscale and Docker interfaces used by Ana Moslem.

sudo install -d -m 0755 /etc/systemd/system/ollama.service.d
sudo tee /etc/systemd/system/ollama.service.d/override.conf >/dev/null <<'EOF'
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=http://localhost:8080,http://127.0.0.1:8080,http://100.88.149.116:8080"
EOF

sudo systemctl daemon-reload
sudo systemctl enable --now ollama
sudo systemctl restart ollama

if sudo ufw status 2>/dev/null | grep -q "Status: active"; then
  sudo ufw allow in on tailscale0 to any port 11434 proto tcp
  sudo ufw allow in on docker0 to any port 11434 proto tcp
fi

curl --fail --silent --show-error http://127.0.0.1:11434/api/tags >/dev/null
echo "Ollama is online locally on port 11434."