import { Injectable } from '@nestjs/common';
import { TasksService } from '../tasks/tasks.service';
import { EventsService } from '../events/events.service';
import { ProjectsService } from '../projects/projects.service';

function startOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

function endOfDay(date: Date) {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function isSameLocalDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

@Injectable()
export class DashboardService {
  constructor(
    private readonly tasks: TasksService,
    private readonly events: EventsService,
    private readonly projects: ProjectsService,
  ) {}

  async getToday(userId: string) {
    const [tasks, events, overdueTasks] = await Promise.all([
      this.tasks.getTodayTasks(userId),
      this.events.getTodayEvents(userId),
      this.tasks.getOverdueCount(userId),
    ]);

    return { tasks, events, overdueTasks };
  }

  async getOverview(userId: string) {
    const today = new Date();
    const from = startOfDay(today);
    const to = endOfDay(addDays(today, 6));

    const [
      scheduledTasks,
      backlogFocusTasks,
      overdueTasks,
      events,
      activeProjects,
    ] = await Promise.all([
      this.tasks.getOpenTasksDueBetween(userId, from, to),
      this.tasks.getBacklogFocusTasks(userId, 5),
      this.tasks.getOverdueTasks(userId, 6),
      this.events.getEventsBetween(userId, from, to),
      this.projects.getActiveSummary(userId, 5),
    ]);

    const todayTasks = scheduledTasks.filter((task) =>
      task.dueAt ? isSameLocalDay(task.dueAt, today) : false,
    );
    const todayEvents = events.filter((event) =>
      isSameLocalDay(event.startsAt, today),
    );
    const priorityTasks = [...overdueTasks, ...todayTasks, ...backlogFocusTasks]
      .filter((task, index, all) => all.findIndex((item) => item.id === task.id) === index)
      .sort((a, b) => {
        const priorityDiff = a.priority - b.priority;
        if (priorityDiff !== 0) return priorityDiff;
        return (a.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER) -
          (b.dueAt?.getTime() ?? Number.MAX_SAFE_INTEGER);
      })
      .slice(0, 8);

    return {
      range: { from, to },
      today: {
        tasks: todayTasks,
        events: todayEvents,
        overdueTasksCount: overdueTasks.length,
      },
      week: {
        tasks: scheduledTasks,
        events,
      },
      overdueTasks,
      backlogFocusTasks,
      priorityTasks,
      activeProjects,
    };
  }
}
