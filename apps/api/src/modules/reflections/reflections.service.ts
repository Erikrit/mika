import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import type { CreateReflectionDto } from '@mika/shared';

@Injectable()
export class ReflectionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
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
  }
}
