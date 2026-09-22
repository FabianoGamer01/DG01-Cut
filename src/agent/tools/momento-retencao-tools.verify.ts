import assert from 'node:assert/strict';
import { execMomentoRetencaoTool } from './momento-retencao-tools.ts';
import type { AgentContext } from '../context.ts';
import type { TimelineState } from '../../editor/types.ts';

function fakeContext(items: TimelineState['items']): AgentContext {
  const state: TimelineState = { fps: 30, width: 1920, height: 1080, items, selectedId: null };
  return {
    getState: () => state,
  } as unknown as AgentContext;
}

async function main() {
  const items: TimelineState['items'] = [
    { id: 'a', track: 'V1', startFrame: 0, durationInFrames: 90, name: 'momento:1', kind: 'video' },
    { id: 'b', track: 'V1', startFrame: 90, durationInFrames: 60, name: 'momento:3', kind: 'video' },
  ];

  const cobreTudo = await execMomentoRetencaoTool(
    'check_momento_coverage',
    { editSessionId: 'x', momentoIds: [1, 2, 3], descartados: [2] },
    fakeContext(items),
  ) as { cobertos: number[]; faltando: number[] };
  assert.deepEqual(cobreTudo.faltando, [], 'momento 2 foi descartado explicitamente, nao falta');
  assert.deepEqual(cobreTudo.cobertos.sort(), [1, 3]);

  const cobreParcial = await execMomentoRetencaoTool(
    'check_momento_coverage',
    { editSessionId: 'x', momentoIds: [1, 2, 3], descartados: [] },
    fakeContext(items),
  ) as { cobertos: number[]; faltando: number[] };
  assert.deepEqual(cobreParcial.faltando, [2],
    'momento 2 nao esta' + " " + 'na timeline nem foi descartado -- cobertura parcial silenciosa e' + " " + 'exatamente o bug que esta ferramenta existe pra matar');

  console.log('momento-retencao-tools.verify: cobertura completa e parcial detectadas corretamente');
}

main();
