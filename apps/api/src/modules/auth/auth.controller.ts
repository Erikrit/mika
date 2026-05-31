import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, type AuthUser } from '../../common/decorators/current-user.decorator';
import { createZodDto } from 'nestjs-zod';
import { LoginSchema } from '@mika/shared';

class LoginDto extends createZodDto(LoginSchema) {}

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @Public()
  @ApiOperation({ summary: 'Login com email e senha' })
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Post('refresh')
  @Public()
  @ApiOperation({ summary: 'Renovar access token via refresh token' })
  async refresh(@Body() body: { refreshToken: string }) {
    return this.authService.refreshToken(body.refreshToken);
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Dados do usuário autenticado' })
  me(@CurrentUser() user: AuthUser) {
    return user;
  }

  @Post('telegram/code')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gerar código de vinculação Telegram (TTL 10 min)' })
  generateTelegramCode(@CurrentUser() user: AuthUser) {
    return this.authService.generateTelegramCode(user.id);
  }
}
