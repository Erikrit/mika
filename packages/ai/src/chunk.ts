import { createHash } from 'crypto';

const APPROX_CHARS_PER_TOKEN = 4;
const MAX_CHUNK_TOKENS = 500;
const OVERLAP_TOKENS = 50;
const MAX_CHUNK_CHARS = MAX_CHUNK_TOKENS * APPROX_CHARS_PER_TOKEN;
const OVERLAP_CHARS = OVERLAP_TOKENS * APPROX_CHARS_PER_TOKEN;
const MIN_CONTENT_LENGTH = 10;

export function estimateTokens(text: string): number {
  return Math.ceil(text.trim().length / APPROX_CHARS_PER_TOKEN);
}

export function computeContentHash(
  userId: string,
  sourceType: string,
  sourceId: string | null,
  content: string,
): string {
  const normalized = content.trim().toLowerCase().replace(/\s+/g, ' ');
  return createHash('sha256')
    .update(`${userId}:${sourceType}:${sourceId ?? ''}:${normalized}`)
    .digest('hex');
}

export function shouldIndexContent(content: string): boolean {
  return content.trim().length >= MIN_CONTENT_LENGTH;
}

function splitWithOverlap(text: string): string[] {
  const trimmed = text.trim();
  if (trimmed.length <= MAX_CHUNK_CHARS) return [trimmed];

  const chunks: string[] = [];
  let start = 0;

  while (start < trimmed.length) {
    const end = Math.min(start + MAX_CHUNK_CHARS, trimmed.length);
    chunks.push(trimmed.slice(start, end).trim());
    if (end >= trimmed.length) break;
    start = end - OVERLAP_CHARS;
  }

  return chunks.filter((c) => c.length >= MIN_CONTENT_LENGTH);
}

export function chunkPlainText(text: string): string[] {
  if (!shouldIndexContent(text)) return [];
  return splitWithOverlap(text);
}

export function chunkMarkdown(content: string): string[] {
  const trimmed = content.trim();
  if (!shouldIndexContent(trimmed)) return [];

  const sections = trimmed.split(/(?=^##\s)/m).filter((s) => s.trim().length > 0);
  if (sections.length <= 1) return chunkPlainText(trimmed);

  const chunks: string[] = [];
  for (const section of sections) {
    chunks.push(...splitWithOverlap(section.trim()));
  }
  return chunks.filter((c) => c.length >= MIN_CONTENT_LENGTH);
}

export function parseMarkdownFrontmatter(content: string): {
  frontmatter: Record<string, string>;
  body: string;
} {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: content };

  const frontmatter: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const idx = line.indexOf(':');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    frontmatter[key] = value;
  }

  return { frontmatter, body: match[2] };
}

export function buildTaskContent(input: {
  title: string;
  description?: string | null;
  projectTitle?: string | null;
}): string {
  const parts = [`Tarefa: ${input.title}`];
  if (input.projectTitle) parts.push(`Projeto: ${input.projectTitle}`);
  if (input.description) parts.push(input.description);
  return parts.join('\n');
}

export function buildProjectContent(input: {
  title: string;
  description?: string | null;
  tags?: string[];
}): string {
  const parts = [`Projeto: ${input.title}`];
  if (input.description) parts.push(input.description);
  if (input.tags?.length) parts.push(`Tags: ${input.tags.join(', ')}`);
  return parts.join('\n');
}

export function buildGoalContent(input: {
  title: string;
  description?: string | null;
  horizon: string;
  progress: number;
}): string {
  const parts = [
    `Objetivo: ${input.title}`,
    `Horizonte: ${input.horizon}`,
    `Progresso: ${input.progress}%`,
  ];
  if (input.description) parts.push(input.description);
  return parts.join('\n');
}

export function buildReflectionContent(content: string): string {
  return `Reflexão:\n${content}`;
}
