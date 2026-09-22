export { MOMENTO_RETENCAO_TOOL_NAMES, MOMENTO_RETENCAO_TOOL_SCHEMAS } from './schemas/momento-retencao-tools';
import type { AgentContext } from '../context';

// check_momento_coverage confere que todo momento_id candidato (da lista
// original gerada pelo sidecar dg01-video, gerar_momentos) foi endereçado na
// timeline. Convenção de dados (decisão desta tarefa, não do agente):
// TimelineItem não tem campo dedicado pra id externo, então um momento
// inserido via edit_item deve nomear o item "momento:<id>" (prefixo literal +
// o momento_id numérico). Um momento é "coberto" se aparecer nesse formato em
// algum TimelineItem.name OU estiver explicitamente em `descartados`.
// "Esquecer" um momento (nem inserir, nem descartar) vira `faltando`
// detectável em vez de sumiço silencioso.

type Args = Record<string, unknown>;

const MOMENTO_PREFIX = 'momento:';

function momentoIdDoItem(name: string): number | null {
  if (!name.startsWith(MOMENTO_PREFIX)) return null;
  const n = Number(name.slice(MOMENTO_PREFIX.length));
  return Number.isFinite(n) ? n : null;
}

export async function execMomentoRetencaoTool(
  name: string,
  args: Args,
  ctx: AgentContext,
): Promise<unknown> {
  if (name !== 'check_momento_coverage') return { error: `unknown tool ${name}` };

  // `editSessionId` e obrigatorio no schema mas nao e lido aqui de proposito:
  // quem despacha a chamada ja escopa `ctx` pra sessao certa antes de chegar
  // neste handler -- nao e' um bug, e' documentacao dessa suposicao.
  const momentoIds = Array.isArray(args.momentoIds) ? (args.momentoIds as number[]) : [];
  const descartados = new Set(Array.isArray(args.descartados) ? (args.descartados as number[]) : []);

  const state = ctx.getState();
  const naTimeline = new Set(
    state.items
      .map((item) => momentoIdDoItem(item.name))
      .filter((id): id is number => id !== null),
  );

  const cobertos: number[] = [];
  const faltando: number[] = [];
  for (const id of momentoIds) {
    if (naTimeline.has(id)) cobertos.push(id);
    else if (!descartados.has(id)) faltando.push(id);
    // else: descartado explicitamente e nao presente na timeline -- resolvido,
    // mas nao "coberto" (nunca foi inserido). Nao aparece em nenhuma das duas
    // listas; so momentos esquecidos (nem inseridos, nem descartados) viram
    // `faltando`.
  }

  return { cobertos, faltando };
}
