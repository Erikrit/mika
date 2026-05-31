import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class RoutineApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string> }>();
    const key = request.headers['x-routine-key'];
    const expected = process.env.ROUTINE_API_KEY;

    if (!expected || key !== expected) {
      throw new UnauthorizedException('Chave de rotina inválida');
    }

    return true;
  }
}
