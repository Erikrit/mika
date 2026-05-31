/** Rótulos pt-BR para enums de contexto/memória (valores da API permanecem em inglês). */

export const CATEGORIA_LABELS: Record<string, string> = {
  LIFE: 'Vida',
  WORK: 'Trabalho',
  FINANCE: 'Finanças',
  PROJECT: 'Projetos',
  ROUTINE: 'Rotina',
  LEARNING: 'Aprendizado',
  RELATIONSHIP: 'Relacionamentos',
  HEALTH: 'Saúde',
  EMOTIONAL: 'Emocional',
  MEMORY: 'Memória',
  CUSTOM: 'Personalizado',
};

export const CAMADA_MEMORIA_LABELS: Record<string, string> = {
  FIXED: 'Fixa',
  EVOLUTIVE: 'Evolutiva',
  SENSITIVE: 'Sensível',
};

export const PRIVACIDADE_LABELS: Record<string, string> = {
  PUBLIC: 'Pública',
  PRIVATE: 'Privada',
  SENSITIVE: 'Sensível',
};

export const CANAL_AUDITORIA_LABELS: Record<string, string> = {
  CHAT: 'Chat web',
  TELEGRAM: 'Telegram',
  ROUTINE: 'Rotina',
};

export const ORIGEM_CHUNK_LABELS: Record<string, string> = {
  TASK: 'Tarefa',
  PROJECT: 'Projeto',
  GOAL: 'Objetivo',
  REFLECTION: 'Reflexão',
  NOTE: 'Nota',
  IMPORT: 'Importação',
};

export function labelCategoria(value: string): string {
  return CATEGORIA_LABELS[value] ?? value;
}

export function labelCamadaMemoria(value: string): string {
  return CAMADA_MEMORIA_LABELS[value] ?? value;
}

export function labelPrivacidade(value: string): string {
  return PRIVACIDADE_LABELS[value] ?? value;
}

export function labelCanalAuditoria(value: string): string {
  return CANAL_AUDITORIA_LABELS[value] ?? value;
}

export function labelOrigemChunk(value: string): string {
  return ORIGEM_CHUNK_LABELS[value] ?? value;
}

export function labelRag(ativo: boolean): string {
  return ativo ? 'RAG ligado' : 'RAG desligado';
}
