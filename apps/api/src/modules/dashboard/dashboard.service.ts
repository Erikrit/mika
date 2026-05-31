import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { EventsService } from '../events/events.service';

@Injectable()
export class DashboardService {
  constructor(
    private readonly tasks: TasksService,
    private readonly events: EventsService,
  ) {}

  async getToday(userId: string) {
    const [tasks, events, overdueTasks] = await Promise.all([
      this.tasks.getTodayTasks(userId),
      this.events.getTodayEvents(userId),
      this.tasks.getOverdueCount(userId),
    ]);

    return { tasks, events, overdueTasks };
  }
}
