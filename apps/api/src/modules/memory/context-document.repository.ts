import { Injectable, NotFoundException } from '@nestjs/common';
import { createHash } from 'crypto';
import type {
  ContextCategory,
  CreateContextDocumentDto,
  UpdateContextDocumentDto,
} from '@mika/shared';
import { PrismaService } from '../prisma/prisma.service';

function hashContent(content: string): string {
  return createHash('sha256').update(content.trim()).digest('hex');
}

@Injectable()
export class ContextDocumentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string, includeArchived = false) {
    return this.prisma.contextDocument.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { archivedAt: null }),
      },
      orderBy: { updatedAt: 'desc' },
      include: {
        currentVersion: { select: { versionNumber: true, createdAt: true } },
        _count: { select: { chunks: true, versions: true } },
      },
    });
  }

  async findOne(userId: string, id: string) {
    const doc = await this.prisma.contextDocument.findFirst({
      where: { id, userId },
      include: {
        currentVersion: true,
        _count: { select: { chunks: true, versions: true } },
      },
    });
    if (!doc) throw new NotFoundException('Documento não encontrado');
    return doc;
  }

  async findVersions(userId: string, documentId: string, preview = false) {
    await this.findOne(userId, documentId);
    const versions = await this.prisma.contextDocumentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
      select: {
        id: true,
        versionNumber: true,
        contentHash: true,
        createdAt: true,
        ...(preview ? { content: true } : {}),
      },
    });

    if (!preview) return versions;

    return versions.map((v) => ({
      id: v.id,
      versionNumber: v.versionNumber,
      contentHash: v.contentHash,
      createdAt: v.createdAt,
      preview: 'content' in v ? String(v.content).slice(0, 200) : undefined,
    }));
  }

  async findVersion(userId: string, documentId: string, versionId: string) {
    await this.findOne(userId, documentId);
    const version = await this.prisma.contextDocumentVersion.findFirst({
      where: { id: versionId, documentId },
      select: {
        id: true,
        versionNumber: true,
        content: true,
        contentHash: true,
        createdAt: true,
      },
    });
    if (!version) throw new NotFoundException('Versão não encontrada');
    return version;
  }

  async create(
    userId: string,
    data: CreateContextDocumentDto & {
      category: ContextCategory;
      memoryType: string;
      privacyLevel: string;
      enabledForRag: boolean;
      retentionType: string;
    },
  ) {
    const contentHash = hashContent(data.content);

    return this.prisma.$transaction(async (tx) => {
      const doc = await tx.contextDocument.create({
        data: {
          userId,
          title: data.title,
          category: data.category,
          memoryType: data.memoryType as never,
          privacyLevel: data.privacyLevel as never,
          enabledForRag: data.enabledForRag,
          retentionType: data.retentionType as never,
          source: (data.source ?? 'import') as never,
        },
      });

      const version = await tx.contextDocumentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          content: data.content,
          contentHash,
        },
      });

      return tx.contextDocument.update({
        where: { id: doc.id },
        data: { currentVersionId: version.id },
        include: { currentVersion: true },
      });
    });
  }

  async addVersion(userId: string, documentId: string, content: string) {
    const doc = await this.findOne(userId, documentId);
    const lastVersion = await this.prisma.contextDocumentVersion.findFirst({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
    });
    const versionNumber = (lastVersion?.versionNumber ?? 0) + 1;
    const contentHash = hashContent(content);

    return this.prisma.$transaction(async (tx) => {
      const version = await tx.contextDocumentVersion.create({
        data: {
          documentId,
          versionNumber,
          content,
          contentHash,
        },
      });

      await tx.contextDocument.update({
        where: { id: documentId },
        data: { currentVersionId: version.id, updatedAt: new Date() },
      });

      await tx.memoryChunk.deleteMany({ where: { documentId } });

      return { document: doc, version };
    });
  }

  async syncChunksGovernance(
    documentId: string,
    data: { memoryType?: string; privacyLevel?: string; enabledForRag?: boolean },
  ) {
    return this.prisma.memoryChunk.updateMany({
      where: { documentId },
      data: {
        ...(data.memoryType != null ? { memoryType: data.memoryType as never } : {}),
        ...(data.privacyLevel != null ? { privacyLevel: data.privacyLevel as never } : {}),
        ...(data.enabledForRag != null ? { enabledForRag: data.enabledForRag } : {}),
      },
    });
  }

  async update(userId: string, id: string, data: UpdateContextDocumentDto) {
    await this.findOne(userId, id);
    return this.prisma.contextDocument.update({
      where: { id },
      data: {
        ...(data.title != null ? { title: data.title } : {}),
        ...(data.category != null ? { category: data.category } : {}),
        ...(data.memoryType != null ? { memoryType: data.memoryType } : {}),
        ...(data.privacyLevel != null ? { privacyLevel: data.privacyLevel } : {}),
        ...(data.enabledForRag != null ? { enabledForRag: data.enabledForRag } : {}),
        ...(data.retentionType != null ? { retentionType: data.retentionType } : {}),
        ...(data.archived === true ? { archivedAt: new Date() } : {}),
        ...(data.archived === false ? { archivedAt: null } : {}),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.contextDocument.delete({ where: { id } });
  }
}
