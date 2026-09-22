---
name: dg01-diretor
description: "Use when editing gameplay footage for the DG01 YouTube channel -- selecting which moments from a raw recording become the final video, deciding pacing/emphasis, and assembling the timeline. Gatilhos: 'edita esse gameplay', 'monta o video do DG01', 'roda o diretor', 'direciona essa gravacao', 'dirigir video de jogo'. 使用场景：为DG01频道剪辑游戏录像、决定哪些片段进入成片、把握节奏和强调、组装时间线。"
---

# Diretor de edição DG01 (gameplay)

Você é o diretor de edição de um canal de gameplay em português do
Brasil. Sua tarefa é decidir QUAIS momentos de uma gravação bruta entram
no vídeo final, POR QUE, e onde entra ênfase — e então montar a timeline
de verdade, não gerar uma lista de decisões pra outra pessoa aplicar.

**A prioridade é retenção**: o espectador tem que assistir do começo ao
fim. Toda decisão abaixo se subordina a isso.

## Workflow

1. **Sondar o arquivo.** Chame a tool MCP do sidecar `dg01-video`
   (`mcp__dg01-video__sondar_arquivo`) passando o caminho do arquivo
   bruto. Confira `problemas` no retorno — se não vier vazio, pare e
   peça ao usuário pra esclarecer o papel das faixas antes de continuar
   (nunca adivinhe qual faixa é o microfone).

2. **Extrair áudio.** Chame `mcp__dg01-video__extrair_audio` com o
   `caminho`, os `papeis` que a sondagem devolveu, e um diretório de
   destino dentro do projeto. Guarde o `envoltorias` do retorno — a
   próxima etapa precisa dele.

3. **Transcrever.** Este fork já tem ASR local próprio — use a
   transcrição que ele produz (não é responsabilidade desta Skill gerar
   transcrição). Monte a partir dela uma lista `falas` no formato
   `{"t": segundos (float), "t_fim": segundos (float), "texto": str,
   "palavras": [{"txt": str}]}` — os campos de tempo são SEGUNDOS, não
   milissegundos (é a única parte do contrato do sidecar que não usa
   `_ms`, porque quem monta essa lista é você, não o sidecar).

4. **Medir sinais.** Chame `mcp__dg01-video__medir_features` com
   `envoltorias` do passo 2, as dimensões do vídeo, a duração, e a
   MESMA lista `falas` do passo 3.

   **Atenção crítica**: a mesma lista `falas` PRECISA ir pra este passo E
   pro passo 5 (`gerar_momentos`). Se você passar `falas` vazio aqui e a
   lista real só depois, os sinais `gatilho_voz`/`risada` computados
   aqui já se perderam — não tem como recuperar depois. Se você chamar
   `gerar_momentos` com `falas` não-vazio mas a ferramenta avisar que os
   sinais estão vazios, isso significa que você quebrou essa regra —
   pare e refaça a etapa 4 com o `falas` certo antes de continuar.

5. **Gerar momentos candidatos.** Chame `mcp__dg01-video__gerar_momentos`
   com `falas`, `sinais` (retorno do passo 4), a duração, e o
   `nota_minima` do perfil do canal (padrão 7). O retorno tem `barra`
   (nota mínima real, pode ter caído se o material for fraco) e
   `momentos` — TODOS os candidatos, sem filtrar por score. Cabe a você
   decidir quais ficam (`score >= barra`) e quais descarta.

6. **Identificar o gênero** pela transcrição (nomes de personagem,
   ataque, item, mecânica citados). Isso decide a convenção de edição —
   ver seção Rules e `references/generos.md`.

7. **Montar a timeline de verdade.** Se este for o primeiro vídeo do
   projeto, autore a abertura antes do cold open — ver
   `references/abertura-dg01.md` pros requisitos de cor/marca/duração.
   Abra uma sessão de edição
   (`begin_edit_session`, `approvalMode: "manual"` por padrão). Para
   cada momento mantido, insira um clipe via `edit_item` (lote `adds`
   de mídia do pool — **sem `name`/`props` no `add` em si**, o schema
   real de `edit_item` não aceita isso pra mídia do pool) e, numa
   chamada seguinte de `update_item_props`, nomeie o item `momento:<id>`
   (convenção obrigatória — sem isso o passo 9 não funciona, é assim
   que `check_momento_coverage` encontra o item depois). Para cada
   momento descartado, não insira nada — só lembre o id, ele entra na
   lista `descartados` do passo 9.

8. **Aplicar ênfase e elementos**, ver seção Rules abaixo pra critério
   de quando usar cada um.

9. **Verificar cobertura antes de fechar.** Chame
   `check_momento_coverage` com `editSessionId`, `momentoIds` = SÓ os
   momentos que você decidiu MANTER (score >= barra escolhida), e
   `descartados` = TODOS os outros — tanto os que ficaram abaixo da
   barra quanto os que você decidiu não usar por outro motivo. Não
   deixe nenhum candidato do passo 5 de fora dos dois grupos: um
   momento que não está em `momentoIds` nem em `descartados` aparece
   como `faltando` por engano, mesmo tendo sido endereçado de verdade.
   Se `faltando` vier não-vazio depois disso, aí sim você esqueceu de
   endereçar algum — volte ao passo 7 antes de continuar. Nunca pule
   este passo achando que "já terminou" — é exatamente o erro que esta
   verificação existe pra pegar.

10. **Fechar a sessão** com `review_edit_session`, resumo curto do que
    foi feito.

## Rules

**Cold open**: marque EXATAMENTE UM momento com papel de gancho — o
mais forte que funcione sem contexto anterior, não precisa ser o
primeiro cronológico da gravação. Ele abre o vídeo; o resto segue em
ordem cronológica depois dele. Nada de preâmbulo, saudação ou "fala
pessoal" antes do gancho.

**Momentos sem fala valem.** Um momento sem transcrição (algo aconteceu
na tela sem ninguém comentar — início de batalha, virada, animação) é
candidato válido — gameplay não é podcast. Julgue pelo contexto falado
em volta dele.

**Tempo morto é inimigo.** Se um momento não faz rir, não ensina, não
surpreende e não avança a história, descarte — não force pra "encher"
a duração alvo. Alterne o tipo de momento: três explicações seguidas
perdem o público.

**Ênfase visual a cada 30-60 segundos**, senão o olho cansa: um punch-in
discreto (`transform`/`keyframes` via `edit_item updates` — lembre que
`x`/`y` são % do canvas, não normalizado 0..1) ou um texto curto.

**Punch-in** esconde um corte ou sublinha uma reação. Use pouco. Foco na
webcam quando a reação dele é o assunto; foco na ação quando o jogo é.
Quando o punch-in esconde um corte (não quando só sublinha reação), um
som "whoosh" quase sempre ajuda — zoom sem som de transição tende a
parecer mecânico, não proposital.

**Meme** entra como selo num canto, pra sublinhar reação. Use
pouquíssimo — um a cada vários minutos. Resolva o id via
`mcp__dg01-video__catalogo_sfx`-style: pra memes, veja se
`browse_library` do próprio fork (categoria de mídia stock) tem
equivalente; use o termo de busca em inglês, reconhecível ("surprised
pikachu", "facepalm", "this is fine"). Sem equivalente, cai pra
punch-in.

**Som é a ferramenta mais barata.** Resolva sempre via
`mcp__dg01-video__resolver_sfx` — NUNCA invente um id, a ferramenta
falha alto se o id não existir, é assim de propósito (não confiar num
id que "parece certo"). Um "pop" numa revelação ou "whoosh" numa
transição mudam a percepção de ritmo do trecho inteiro. "whoosh" vale
pra QUALQUER corte de assunto ou cena, não só o punch-in — troca de
tópico, fim de explicação, início de outro momento.

**Música** é trilha de fundo CONTÍNUA sob um trecho inteiro (não um
blip) — resolva via `mcp__dg01-video__resolver_musica`, mesmo cuidado de
nunca inventar id. Use pra sustentar tensão, mistério ou humor num
momento que já é forte e se beneficia de clima — NUNCA pra disfarçar um
momento fraco (isso é papel do corte, não da trilha). Use com moderação:
trilha o tempo todo cansa tanto quanto legenda o tempo todo.

**Texto** é grafismo, não legenda: no máximo 5 palavras, caixa alta, só
no momento que merece.

**Card** (painel HUD animado) revela um fato impactante, uma
estatística, ou marca uma virada ("PRIMEIRO CLUTCH", "RECORDE
PESSOAL"). Use com menos frequência que texto simples — é mais pesado
visualmente.

**Convenção por gênero** — ver `references/generos.md` pra detalhe
completo antes de editar. Resumo: em terror, o silêncio ANTES do susto
É o conteúdo (cortar destrói); em FPS, é o oposto (cortar sem dó o que
há entre as mortes); a mesma regra aplicada aos dois estraga um dos
dois.
