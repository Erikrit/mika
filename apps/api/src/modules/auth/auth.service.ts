import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import type { Prisma } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciais inválidas');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Credenciais inválidas');

    return { id: user.id, email: user.email, name: user.name };
  }

  async login(authUser: AuthUser) {
    const payload = { sub: authUser.id, email: authUser.email };
    const accessToken = this.jwt.sign(payload, {
      secret: process.env.JWT_SECRET,
      expiresIn: '15m',
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET,
      expiresIn: '7d',
    });
    return { accessToken, refreshToken, user: authUser };
  }

  async generateTelegramCode(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException();

    if (user.telegramChatId) {
      throw new ConflictException('Telegram já vinculado a esta conta');
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const preferences = {
      ...(user.preferences as Record<string, unknown>),
      telegramLinkCode: { code, expiresAt: expiresAt.toISOString() },
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: { preferences: preferences as Prisma.InputJsonValue },
    });

    return { code, expiresAt };
  }

  async linkTelegramByCode(code: string, telegramChatId: string) {
    const users = await this.prisma.user.findMany({
      where: { telegramChatId: null },
    });

    const now = new Date();
    let matchedUser: (typeof users)[0] | null = null;

    for (const user of users) {
      const prefs = user.preferences as Record<string, unknown>;
      const linkData = prefs?.telegramLinkCode as
        | { code?: string; expiresAt?: string }
        | undefined;
      if (
        linkData?.code === code &&
        linkData.expiresAt &&
        new Date(linkData.expiresAt) > now
      ) {
        matchedUser = user;
        break;
      }
    }

    if (!matchedUser) {
      throw new BadRequestException('Código inválido ou expirado');
    }

    const existing = await this.prisma.user.findFirst({
      where: { telegramChatId },
    });
    if (existing) {
      throw new ConflictException('Este Telegram já está vinculado a outra conta');
    }

    const prefs = matchedUser.preferences as Record<string, unknown>;
    const { telegramLinkCode: _, ...restPrefs } = prefs;

    await this.prisma.user.update({
      where: { id: matchedUser.id },
      data: {
        telegramChatId,
        preferences: restPrefs as Prisma.InputJsonValue,
      },
    });

    return { userId: matchedUser.id, name: matchedUser.name };
  }

  async refreshToken(token: string) {
    try {
      const payload = this.jwt.verify<{ sub: string; email: string }>(token, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException();
      return this.login({ id: user.id, email: user.email, name: user.name });
    } catch {
      throw new UnauthorizedException('Refresh token inválido');
    }
  }
}
