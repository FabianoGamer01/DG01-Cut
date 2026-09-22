// STATUS (2026-09-22): CORRIGIDO. check_momento_coverage esta em
// READ_ONLY_TOOL_NAMES (src/agent/external-tool-policy.ts) -- nunca muta
// nada, so' le' via ctx.getState(). READ_ONLY_TOOL_NAMES ainda satisfaz
// isExternalDraftTool (isExternalReadTool(name) || DRAFT_EDIT_TOOL_NAMES.has
// (name)), entao a chamada continua rodando contra o draft isolado da
// sessao (onde edit_item escreveu os itens "momento:<id>"), nao contra o
// projeto ao vivo. Repro original (rodada 1, ja' resolvida) documentado
// externamente a este repo em
// DragonGnome01/.superpowers/sdd/2026-09-22-dg01-cut-diretor-skill/
// task-4-report.md.
import assert from 'node:assert/strict';
import { makeDraft } from '../editor/store';
import { ExternalBridgeRuntime } from './external-bridge-runtime';
import { revisionOf } from './external-edit-session';
import { base } from './external-edit-session-core.verify';

const PROJECT_ID = 'dg01-replay-project';
const EDITOR_INSTANCE_ID = 'dg01-replay-editor';

const live = makeDraft(base);
const runtime = new ExternalBridgeRuntime(
  PROJECT_ID,
  EDITOR_INSTANCE_ID,
  () => ({
    commands: live.commands,
    getState: live.getState,
    getDoc: live.getDoc,
    getCreativeMode: () => null,
    templates: [],
    audio: [],
    getProjectId: () => PROJECT_ID,
  }),
  () => undefined,
  {
    saveProject: async (projectId: string) => ({
      projectId, revision: 1, epoch: 1, status: 'saved',
      saved: true, indexUpdated: true,
    }),
    saveAutomaticVersion: async () => null,
    saveExternalProposal: async () => undefined,
  },
);

// Ajuste #2 sobre o esqueleto original do brief (confirmado no Passo 1
// contra external-edit-session-runtime.verify.ts): `runtimeBinding`
// exportado dali e' um fixture FIXO amarrado a 'runtime-project'/
// 'runtime-editor' (o par usado pelo ExternalBridgeRuntime daquele
// arquivo) -- reusa-lo aqui com um runtime construido para
// 'dg01-replay-project'/'dg01-replay-editor' dispara
// ExternalEditSessionOutcomeError('stale', "different project or editor
// instance") em validateExternalBridgeBinding. O shape em si bateu com o
// suposto pelo brief ({projectId, editorInstanceId, baseRevision}); so
// precisei construir minha propria instancia com os ids deste runtime,
// exatamente como external-edit-session-apply.verify.ts faz com
// `proposalIdBinding`.
const binding = {
  projectId: PROJECT_ID,
  editorInstanceId: EDITOR_INSTANCE_ID,
  baseRevision: revisionOf(base),
};

async function main() {
  // Sequencia roteirizada representando 4 momentos candidatos: 2 mantidos
  // (um deles o gancho), 2 descartados. Nao chama nenhum LLM -- e' a
  // sequencia que a Skill dg01-diretor DEVERIA produzir num caso simples.
  //
  // Ajuste sobre o esqueleto original do brief (confirmado no Passo 1 contra
  // src/agent/tools/schemas/edit-item-tools.ts e edit-item-generic.ts):
  // edit_item nao tem um add kind "clip" -- adds de midia do pool sao
  // type:"video"|"image"|"gif"|"svg"|"audio" e REJEITAM um campo `name`
  // direto (regra "no name/props on pool adds", GENERIC_ADD_KEYS nao inclui
  // name; teria que ser um update_item_props separado). Pra nao depender de
  // um asset fixture no pool so' pra nomear o item, uso adds authored
  // type:"solid" (AUTHORED_ADD_KEYS inclui `name` diretamente, sem
  // assetId) -- e' o jeito mais direto de materializar "momento:<id>" como
  // item da timeline pra check_momento_coverage encontrar.
  const beginInfo = await runtime.execute(
    'begin_edit_session',
    { approvalMode: 'auto' },
    binding,
  );
  const editSessionId = String(
    beginInfo && typeof beginInfo === 'object' && 'editSessionId' in beginInfo
      ? (beginInfo as { editSessionId: unknown }).editSessionId
      : '',
  );
  assert.ok(editSessionId, 'begin_edit_session devolveu um id de sessao');

  // Momento 1 = gancho (entra primeiro, mesmo nao sendo o cronologicamente primeiro)
  await runtime.execute('edit_item', {
    editSessionId,
    adds: [{ type: 'solid', track: 'V1', fromFrame: 0, durationInFrames: 90, name: 'momento:1' }],
  }, binding);
  // Momento 3 = corpo, cronologicamente depois
  await runtime.execute('edit_item', {
    editSessionId,
    adds: [{ type: 'solid', track: 'V1', fromFrame: 90, durationInFrames: 60, name: 'momento:3' }],
  }, binding);

  const coverage = await runtime.execute('check_momento_coverage', {
    editSessionId,
    momentoIds: [1, 2, 3, 4],
    descartados: [2, 4],
  }, binding) as { cobertos: number[]; faltando: number[] };

  assert.deepEqual(coverage.faltando, [], 'todos os 4 candidatos foram endereçados -- 2 na timeline, 2 descartados');
  assert.deepEqual(coverage.cobertos.sort(), [1, 3]);

  await runtime.execute('review_edit_session', {
    editSessionId,
    summary: 'replay de teste: 2 mantidos, 2 descartados',
  }, binding);

  console.log('dg01-diretor-replay.verify: sequencia roteirizada de tool calls passou sem LLM');
}

main();
