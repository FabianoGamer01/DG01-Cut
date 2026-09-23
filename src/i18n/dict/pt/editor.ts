// PT dictionary (field fragmentation, key = Chinese original text). Data files are exempt from the upper limit of row count.
// Source: src/editor/types.ts UI label of top-level constant (the constant body remains in Chinese, and the usage package is t(label)).
// The dynamic label v1 of undo historical/project data stored in reduce/store does not enter i18n (see the scanning rules).
export default {
  // ZOOM_SHAPE_LABELS
  '冲击': 'Impacto',
  '推进拉回': 'Avançar e Recuar',
  '慢推': 'Avanço Lento',
  '瞬时': 'Instantâneo',
  '拉远': 'Afastar',
  '缓入推近': 'Avanço com Ease-In',
  '弹性推近': 'Avanço Elástico',
  '快切推近': 'Avanço Rápido',
  '心跳脉冲': 'Pulsação',
  '甩入推近': 'Avanço com Chicote',
  // TRANSITION_LABELS
  '推进转场': 'Zoom de Antecipação',
  '白色划线转场': 'Wipe de Linha Limpa',
  '叠化转场': 'Dissolução Cruzada',
  '闪黑转场': 'Fade para Preto',
  '闪白转场': 'Flash',
  '冲击抖动转场': 'Tremor de Impacto',
  '叠加转场': 'Mescla de Luminância',
  '光溶转场': 'Dissolução Orgânica',
  '翻页转场': 'Virar Página',
  '焦点转场': 'Troca de Foco',
  '柔化擦除转场': 'Wipe Suave',
  '甩镜转场': 'Whip Pan',
  '圆形擦除转场': 'Wipe Circular',
  '人声分离失败，未修改任何片段。': 'Falha ao isolar a voz; nenhum clipe foi modificado.',
  '响度分析失败，未修改任何片段。': 'Falha na análise de volume; nenhum clipe foi modificado.',
  '所选片段的源素材已变化，旧的人声分离结果已丢弃。请重试。': 'O material de origem do clipe selecionado mudou; o resultado anterior do isolamento de voz foi descartado. Tente novamente.',
} as Record<string, string>;
