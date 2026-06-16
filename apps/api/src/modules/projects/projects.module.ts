import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectDraftAiService } from './project-draft-ai.service';
import { MemoryModule } from '../memory/memory.module';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [MemoryModule, TasksModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectDraftAiService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
