import type { AgentToolSchema } from '../../tool-schema';

export const MOMENTO_RETENCAO_TOOL_SCHEMAS: AgentToolSchema[] = [
  {
    name: 'check_momento_coverage',
    description:
      'Confere se todos os momentos candidatos (do sidecar dg01-video, ' +
      'gerar_momentos) ja foram endereçados na timeline -- inseridos ' +
      '(item nomeado "momento:<id>") ou explicitamente descartados. ' +
      'Nunca confie no proprio julgamento de que "terminou" -- chame esta ' +
      'ferramenta antes de review_edit_session.',
    input_schema: {
      type: 'object',
      properties: {
        editSessionId: { type: 'string' },
        momentoIds: {
          type: 'array',
          items: { type: 'number' },
          description: 'todos os momento_id da lista candidata original',
        },
        descartados: {
          type: 'array',
          items: { type: 'number' },
          description: 'momento_id explicitamente descartados (nao inseridos de proposito)',
        },
      },
      required: ['editSessionId', 'momentoIds'],
    },
  },
];

export const MOMENTO_RETENCAO_TOOL_NAMES = new Set(MOMENTO_RETENCAO_TOOL_SCHEMAS.map((t) => t.name));
