export type ContextTemplate = {
  id: string;
  title: string;
  description: string;
  category: string;
  memoryType: string;
  privacyLevel: string;
  enabledForRag: boolean;
  content: string;
};

export const CONTEXT_TEMPLATES: ContextTemplate[] = [
  {
    id: 'perfil-mika',
    title: 'Perfil para a Mika',
    description: 'Tom, acolhimento, o que evitar e necessidades emocionais.',
    category: 'EMOTIONAL',
    memoryType: 'FIXED',
    privacyLevel: 'PRIVATE',
    enabledForRag: true,
    content: `# Perfil para a Mika

## Como quero ser tratado(a)
<!-- Ex.: com calma, sem julgamento, usando meu nome -->

## Tom e estilo preferidos
<!-- Ex.: direto mas gentil, humor leve, mensagens curtas -->

## O que me acolhe
<!-- Ex.: validação emocional, perguntas abertas, celebrar pequenas vitórias -->

## O que evitar
<!-- Ex.: tom moralista, excesso de otimismo, comparações -->

## Necessidades emocionais atuais
<!-- Ex.: preciso de mais estrutura / mais flexibilidade / mais escuta -->
`,
  },
  {
    id: 'objetivos-vida',
    title: 'Objetivos de Vida',
    description: 'Metas de longo prazo, valores e direção pessoal.',
    category: 'LIFE',
    memoryType: 'FIXED',
    privacyLevel: 'PRIVATE',
    enabledForRag: true,
    content: `# Objetivos de Vida

## Visão de longo prazo
<!-- Onde quero estar em 5–10 anos -->

## Valores centrais
<!-- O que não abro mão na minha vida -->

## Metas principais
<!-- 3–5 objetivos concretos -->

## Áreas de foco atual
<!-- O que merece atenção neste momento -->

## O que já avancei
<!-- Conquistas recentes que quero que a Mika lembre -->
`,
  },
  {
    id: 'como-trabalhar',
    title: 'Como Trabalhar Comigo',
    description: 'Estilo profissional, preferências e limites no trabalho.',
    category: 'WORK',
    memoryType: 'FIXED',
    privacyLevel: 'PRIVATE',
    enabledForRag: true,
    content: `# Como Trabalhar Comigo

## Estilo de trabalho
<!-- Ex.: foco em blocos, multitarefa, preciso de prazos claros -->

## Preferências de comunicação
<!-- Ex.: resumos no início, bullet points, evitar reuniões longas -->

## Horários e energia
<!-- Ex.: mais produtivo de manhã, evitar tarefas pesadas à noite -->

## Limites e fronteiras
<!-- Ex.: não trabalho fins de semana, preciso de pausas -->

## Projetos e prioridades atuais
<!-- O que está no topo da lista profissional agora -->
`,
  },
];
