# Local Ollama deployment

Ana Moslem uses the Ollama service already installed on the Ubuntu host. Do
not install a second Ollama container in Portainer and do not expose port 11434
to the public internet.

## One-time Ubuntu setup

From an SSH session on `telstp-server-issh`, run:

```bash
bash scripts/enable-ollama-host.sh
```

If the repository is not present on the server yet, use the same contents from
the `scripts/enable-ollama-host.sh` file in the GitHub repository. The script
binds Ollama for private Docker/Tailscale access, keeps it enabled after reboot,
and verifies the local API.

Confirm the model exists:

```bash
ollama list
```

The confirmed model is:

```text
qwen2.5:3b
```

## Portainer stack

Create a new stack from:

```text
https://github.com/TELsTP/AnAmoslem.git
```

Use:

```text
docker-compose.telstp.yml
```

The compose file already:

- keeps Ollama on the Ubuntu host;
- connects the Ana Moslem container through `host.docker.internal`;
- selects `qwen2.5:3b`;
- exposes Ana Moslem on host port `8080`;
- leaves Portainer's existing `8000` and `9443` ports untouched.

The Ollama endpoint is server-side only:

```text
http://host.docker.internal:11434/v1
```

Never publish port `11434` through the router or a public domain.