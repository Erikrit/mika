import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { join } from 'path';
import { LoggerModule } from 'nestjs-pino';
import { APP_PIPE } from '@nestjs/core';
import { ZodValidationPipe } from 'nestjs-zod';

import { PrismaModule } from './modules/prisma/prisma.module';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { LifeAreasModule } from './modules/life-areas/life-areas.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { GoalsModule } from './modules/goals/goals.module';
import { EventsModule } from './modules/events/events.module';
import { ReflectionsModule } from './modules/reflections/reflections.module';
import { FinanceGoalsModule } from './modules/finance-goals/finance-goals.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { TelegramModule } from './modules/telegram/telegram.module';
import { ChatModule } from './modules/chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [
        join(__dirname, '../../../.env'),
        join(process.cwd(), '.env'),
        join(process.cwd(), '../../.env'),
      ],
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
      },
    }),
    PrismaModule,
    HealthModule,
    AuthModule,
    LifeAreasModule,
    TasksModule,
    ProjectsModule,
    GoalsModule,
    EventsModule,
    ReflectionsModule,
    FinanceGoalsModule,
    DashboardModule,
    ChatModule,
    TelegramModule,
  ],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
