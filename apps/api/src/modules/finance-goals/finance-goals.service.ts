import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EncryptionService } from '../../common/encryption.service';
import type { CreateFinanceGoalDto, UpdateFinanceGoalDto } from '@mika/shared';

@Injectable()
export class FinanceGoalsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly encryption: EncryptionService,
  ) {}

  async create(userId: string, dto: CreateFinanceGoalDto) {
    const goal = await this.prisma.financeGoal.create({
      data: {
        userId,
        lifeAreaId: dto.lifeAreaId,
        title: dto.title,
        targetAmount: this.encryption.encryptNumber(dto.targetAmount),
        currentAmount: this.encryption.encryptNumber(dto.currentAmount),
        currency: dto.currency,
        targetDate: dto.targetDate,
        status: (dto.status ?? 'active').toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
    return this.decrypt(goal);
  }

  async findAll(userId: string) {
    const goals = await this.prisma.financeGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { lifeArea: true },
    });
    return goals.map((g) => this.decrypt(g));
  }

  async findOne(userId: string, id: string) {
    const goal = await this.prisma.financeGoal.findFirst({
      where: { id, userId },
      include: { lifeArea: true },
    });
    if (!goal) throw new NotFoundException('Meta financeira não encontrada');
    return this.decrypt(goal);
  }

  async update(userId: string, id: string, dto: UpdateFinanceGoalDto) {
    await this.findOne(userId, id);
    const data: Record<string, unknown> = { ...dto };
    if (dto.targetAmount !== undefined) data.targetAmount = this.encryption.encryptNumber(dto.targetAmount);
    if (dto.currentAmount !== undefined) data.currentAmount = this.encryption.encryptNumber(dto.currentAmount);
    if (dto.status) data.status = dto.status.toUpperCase();
    delete data.targetAmount;
    delete data.currentAmount;

    const goal = await this.prisma.financeGoal.update({
      where: { id },
      data: {
        ...data,
        ...(dto.targetAmount !== undefined && { targetAmount: this.encryption.encryptNumber(dto.targetAmount) }),
        ...(dto.currentAmount !== undefined && { currentAmount: this.encryption.encryptNumber(dto.currentAmount) }),
        status: dto.status?.toUpperCase() as never,
      },
      include: { lifeArea: true },
    });
    return this.decrypt(goal);
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.financeGoal.delete({ where: { id } });
  }

  private decrypt(goal: { targetAmount: string; currentAmount: string; [key: string]: unknown }) {
    const targetAmount = this.encryption.decryptNumber(goal.targetAmount);
    const currentAmount = this.encryption.decryptNumber(goal.currentAmount);
    const progress = targetAmount > 0 ? Math.round((currentAmount / targetAmount) * 100) : 0;
    return { ...goal, targetAmount, currentAmount, progress };
  }
}
