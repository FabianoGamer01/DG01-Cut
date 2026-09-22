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
      'decidir. `momentoIds` tem que conter TODOS os candidatos, ' +
      'mantidos ou nao. Qualquer momento_id com score abaixo da barra ' +
      'que voce decidiu NAO usar tem que entrar em `descartados` -- ele ' +
      'continua presente em `momentoIds`, so nao vai pra timeline. Se ' +
      'voce esquecer de colocar em `descartados`, ele aparece como ' +
      '`faltando` por engano, mesmo nunca tendo sido pra entrar na ' +
      'timeline. ' +
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
            'todos os momento_id da lista candidata original (do ' +
            'gerar_momentos), nao so os mantidos. Os que voce decidiu ' +
            'nao usar continuam aqui E entram tambem em `descartados`.',
        },
        descartados: {
          type: 'array',
          items: { type: 'number' },
          description:
            'os momento_id (subconjunto de `momentoIds`) que voce ' +
            'decidiu nao usar (abaixo da barra adaptativa ou por outro ' +
            'motivo) -- nao inseridos na timeline de proposito.',
        },
      },
      required: ['editSessionId', 'momentoIds'],
    },
  },
];

export const MOMENTO_RETENCAO_TOOL_NAMES = new Set(MOMENTO_RETENCAO_TOOL_SCHEMAS.map((t) => t.name));
