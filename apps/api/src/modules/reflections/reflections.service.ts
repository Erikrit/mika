import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import { MemoryQueueService } from '../memory/memory-queue.service';
import type { CreateReflectionDto } from '@mika/shared';

@Injectable()
export class ReflectionsService {
  constructor(
    @InjectPinoLogger(ReflectionsService.name) private readonly logger: PinoLogger,
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
    private readonly memoryQueue: MemoryQueueService,
  ) {}

  async create(userId: string, dto: CreateReflectionDto) {
    const encryptedContent = this.encryption.encrypt(dto.content);
    const reflection = await this.prisma.reflection.create({
      data: {
        userId,
        content: encryptedContent,
        energyLevel: dto.energyLevel?.toUpperCase() as never,
        mood: dto.mood,
        routineType: dto.routineType?.toUpperCase() as never,
      },
    });
    this.enqueueReflectionMemory(userId, reflection.id);
    return { ...reflection, content: dto.content };
  }

  async findAll(userId: string) {
    const reflections = await this.prisma.reflection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return reflections.map((r) => ({
      ...r,
      content: this.encryption.decrypt(r.content),
    }));
  }

  async findOne(userId: string, id: string) {
    const reflection = await this.prisma.reflection.findFirst({
      where: { id, userId },
    });
    if (!reflection) throw new NotFoundException('Reflexão não encontrada');
    return { ...reflection, content: this.encryption.decrypt(reflection.content) };
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.reflection.delete({ where: { id } });
    this.enqueueReflectionMemoryDelete(userId, id);
  }

  private enqueueReflectionMemory(userId: string, reflectionId: string) {
    void this.memoryQueue.enqueueUpsert(userId, 'REFLECTION', reflectionId).catch((err) => {
      this.logger.warn({ err, reflectionId }, 'Falha ao enfileirar indexação de reflexão');
    });
  }

  private enqueueReflectionMemoryDelete(userId: string, reflectionId: string) {
    void this.memoryQueue.enqueueDelete(userId, 'REFLECTION', reflectionId).catch((err) => {
      this.logger.warn({ err, reflectionId }, 'Falha ao enfileirar remoção de reflexão da memória');
    });
  }
}
