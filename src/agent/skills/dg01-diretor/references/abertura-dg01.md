# Abertura do canal DG01

Ao montar o primeiro vídeo de um projeto novo (ou quando o usuário pedir
"abertura"/"intro"), a timeline abre com uma abertura curta (2-4s) antes
do cold open, autorada via `create_motion_graphic_from_code` (skill
`create-motion-graphics` tem o passo a passo de como autorar JSX
inline — siga esse fluxo, esta referência só define os requisitos de
CONTEÚDO, não repete o mecanismo).

## Requisitos obrigatórios

- **Cor de fundo**: `#16253D` (azul-noturno escuro). **NUNCA** use
  `#08111F` ou qualquer cor com luma abaixo do limiar de "pixel preto"
  do QC (achado real, já pago caro: o `blackdetect` do processo de
  qualidade usa `pic_th=0.98`, e um fundo mais escuro que isso conta a
  abertura inteira como tela quebrada, mesmo sendo intencional).
- **Cores de marca**: dourado `#C9A227` (destaque, texto principal),
  azul-oceano `#0B3D63` (elemento secundário/sombra).
- **Duração**: 2-4 segundos. Mais que isso rouba tempo do cold open.
- **Conteúdo**: nome do jogo (identificado no Workflow, passo 6) em
  destaque — a abertura não precisa de mais que isso, um gancho vazio
  atrás de uma logo genérica não ajuda retenção.

## O que NÃO fazer

- Não reutilize um asset de Motion Graphic de outro projeto copiando
  código de um lugar fixo — cada projeto autora a própria abertura
  (mesmo conteúdo, mas respeitando o canvas/fps daquele projeto
  específico).
- Não deixe a abertura mais longa que o próprio cold open que vem
  depois — se está competindo em duração com o gancho, está errada.
