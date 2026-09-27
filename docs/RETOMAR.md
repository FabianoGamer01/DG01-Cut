# Retomar o projeto DG01 (nota de handoff)

Projeto pausado em 2026-09-27 -- tudo relacionado a ele foi removido da
máquina local (clones, configs, caches, vídeos renderizados) pra liberar
espaço, mas o histórico continua íntegro no GitHub. Este arquivo existe
pra reconstruir o ambiente do zero quando o trabalho for retomado.

## Repositórios

- **DG01-Cut** -- `github.com/FabianoGamer01/DG01-Cut` (público, fork de
  `0xsline/OpenChatCut`). Ativo, não arquivado. Editor de vídeo AI-native
  com timeline multitrack, agentes, MCP e render via Remotion.
- **dg01-video** -- `github.com/FabianoGamer01/dg01-video` (privado).
  **Arquivado** (somente leitura) em 2026-09-27 -- desarquive antes de
  voltar a mexer (`gh api -X PATCH repos/FabianoGamer01/dg01-video -f archived=false`).
  Sidecar Python/MCP de análise de gravação bruta (ffmpeg/OpenCV/numpy)
  usado pelo DG01-Cut.
- **DG01-Arquivos** -- `github.com/FabianoGamer01/DG01-Arquivos` (privado).
  Gerenciador de arquivos próprio (substitui o Dolphin no DragonGnome01) --
  projeto separado, não depende do editor de vídeo.

## Como reinstalar o DG01-Cut

```bash
git clone https://github.com/FabianoGamer01/DG01-Cut.git
cd DG01-Cut
nvm use            # respeita .nvmrc
npm install
cp .env.example .env.local   # preencher as chaves de API que forem usadas
```

- `npm run dev:isolated` (ou `./dev-with-mcp.sh`) sobe o servidor local de
  dev em `http://localhost:5199`, que expõe um endpoint MCP em
  `/api/external-mcp/mcp` -- já registrado em `.mcp.json` do repo, então o
  Claude Code conecta automaticamente ao abrir o projeto.
- `predev`/`predev:isolated` sincronizam modelos do MediaPipe e o binário
  do `whisper-cli` automaticamente (`npm run sync:mediapipe`,
  `npm run sync:whisper-cli`) -- não precisa baixar nada manualmente.
- Não usa Docker nem banco de dados externo -- é local-first, dados ficam
  em disco (`MEDIA_DIR` opcional no `.env.local`; padrão
  `public/media/uploads/`).
- `.env.local` nunca foi commitado (gitignored) -- as chaves de API usadas
  antes (Anthropic, Fal.ai, etc.) **não sobreviveram** à limpeza da
  máquina e precisam ser recadastradas manualmente. Ver `.env.example` e
  `FAL.md` pra referência de cada provider.

## Como reinstalar o dg01-video (sidecar)

```bash
git clone https://github.com/FabianoGamer01/dg01-video.git
cd dg01-video
pip install -e ".[dev]"
git lfs pull        # materializa a fixture de teste real (tests/fixtures/live-90s.mkv)
```

- Roda via `python -m dg01video.mcp_server`, servindo MCP por **stdio**
  (não é uma porta HTTP) -- é o processo do DG01-Cut que sobe isso como
  subprocesso via `StdioServerParameters`.
- Precisa de `ffmpeg` no PATH.
- Modelo opcional de detecção de rosto (YuNet, pra webcam) era esperado em
  `~/.local/share/dg01-video/modelos/face_detection_yunet_2023mar.onnx`
  -- **esse arquivo foi apagado na limpeza** e precisa ser rebaixado de
  novo se a feature de webcam for usada (sem ele, `medir_features`
  simplesmente não reporta webcam, não quebra nada).

## Obsidian

O vault de notas do projeto **não é** deste repo -- vive dentro do repo
`DragonGnome01` (`vault/` na raiz, pasta `DG01/` dentro dele), que é o
ambiente de desktop do usuário e não foi tocado na limpeza. As notas em
`vault/DG01/Apps DG01.md` e `Integrações Externas.md` cobrem sobretudo o
DragonGnome01 (DG01 Arquivos, Software Center), não o editor de vídeo.

- App: Obsidian via Flatpak (`md.obsidian.Obsidian`).
- MCP: plugin **Local REST API** expõe um servidor MCP local em
  `http://127.0.0.1:27123/mcp/` (HTTP simples, token Bearer salvo em
  `~/.claude.json` -> `mcpServers.obsidian`). Só funciona com o app
  Obsidian aberto.

## O que foi apagado da máquina em 2026-09-27

Repos locais (`~/dev/DG01-Cut`, `~/dev/dg01-video`, `~/dev/DG01-Arquivos`),
configs (`~/.config/dg01-video`, `~/.local/lib/dg01-video`,
`~/.local/share/dg01-video`), vídeos renderizados
(`~/Vídeos/DG01 Video`, ~11GB), o app `dg01-software-center`
(`~/.local/share/dg01-software-center`), o histórico de backups do tema
do desktop (`~/.local/share/dg01-premium-backups` -- não é deste
projeto, é do DragonGnome01, mas foi incluído no pedido), atalhos
`.desktop` e caches do Claude Code. O timer `dg01-backup.timer`
continua ativo e vai recriar backups novos a partir de agora.

Nada disso afetou o `DragonGnome01` (tema, boot, cursor, sons) nem o
backup borg em `/var/backups/dg01-borg`.
