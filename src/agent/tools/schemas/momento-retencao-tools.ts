import type { AgentToolSchema } from '../../tool-schema';

export const MOMENTO_RETENCAO_TOOL_SCHEMAS: AgentToolSchema[] = [
  {
    name: 'check_momento_coverage',
    description:
      'Confere se todos os momentos candidatos (do sidecar dg01-video, ' +
      'gerar_momentos) ja foram endereçados na timeline -- inseridos ' +
      'ou explicitamente descartados. ' +
      'IMPORTANTE (convencao de nome): o item na timeline que representa ' +
      'um momento TEM que se chamar exatamente "momento:<id>" (ex.: ' +
      '"momento:3") -- e assim que esta ferramenta encontra o item ' +
      'depois. edit_item nao aceita name em adds de midia do pool; use ' +
      'update_item_props apos o add pra setar esse name antes de chamar ' +
      'esta ferramenta. ' +
      'IMPORTANTE (barra adaptativa): gerar_momentos devolve TODOS os ' +
      'momentos candidatos, sem filtrar por score -- a barra ' +
      '(momentos.barra) e so um numero devolvido pra quem chama ' +
      'decidir. Qualquer momento_id com score abaixo da barra que voce ' +
      'decidiu NAO usar tem que entrar em `descartados` (ou ser excluido ' +
      'de `momentoIds`) -- senao ele aparece como `faltando` por engano, ' +
      'mesmo nunca tendo sido pra entrar na timeline. ' +
      'Nunca confie no proprio julgamento de que "terminou" -- chame esta ' +
      'ferramenta antes de review_edit_session.',
    input_schema: {
      type: 'object',
      properties: {
        editSessionId: { type: 'string' },
        momentoIds: {
          type: 'array',
          items: { type: 'number' },
          description:
            'todos os momento_id da lista candidata original que voce ' +
            'decidiu MANTER (score >= barra escolhida). Momentos abaixo ' +
            'da barra que voce descartou de proposito vao em ' +
            '`descartados`, nao aqui.',
        },
        descartados: {
          type: 'array',
          items: { type: 'number' },
          description:
            'momento_id explicitamente descartados (nao inseridos de ' +
            'proposito) -- inclui tanto momentos abaixo da barra ' +
            'adaptativa quanto momentos acima da barra que voce decidiu ' +
            'nao usar por outro motivo.',
        },
      },
      required: ['editSessionId', 'momentoIds'],
    },
  },
];

export const MOMENTO_RETENCAO_TOOL_NAMES = new Set(MOMENTO_RETENCAO_TOOL_SCHEMAS.map((t) => t.name));
