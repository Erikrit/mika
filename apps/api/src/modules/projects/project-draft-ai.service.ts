import { BadRequestException, Injectable } from '@nestjs/common';
import { generateProjectDraft } from '@mika/ai';
import type { CreateProjectDraftDto } from '@mika/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProjectDraftAiService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(userId: string, dto: CreateProjectDraftDto) {
    this.validateFile(dto);

    const availableLifeAreas = await this.prisma.lifeArea.findMany({
      where: { userId },
      select: { slug: true, label: true },
      orderBy: { label: 'asc' },
    });

    try {
      return await generateProjectDraft({
        ...dto,
        prompt: dto.prompt?.trim(),
        file: dto.file
          ? {
              name: dto.file.name,
              content: dto.file.content.trim().slice(0, 30_000),
            }
          : undefined,
        availableLifeAreas,
      });
    } catch {
      throw new BadRequestException(
        'Nao foi possivel gerar o rascunho do projeto agora. Revise a entrada e tente novamente.',
      );
    }
  }

  private validateFile(dto: CreateProjectDraftDto) {
    if (!dto.file) return;

    const normalizedName = dto.file.name.toLowerCase();
    const supported = normalizedName.endsWith('.md') || normalizedName.endsWith('.txt');

    if (!supported) {
      throw new BadRequestException('Formato de arquivo nao suportado. Use .md ou .txt.');
    }
  }
}
