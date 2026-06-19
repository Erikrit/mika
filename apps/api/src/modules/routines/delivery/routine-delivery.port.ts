export const ROUTINE_DELIVERY = Symbol('ROUTINE_DELIVERY');

export type RoutineChannel = 'WEB' | 'TELEGRAM';

export interface RoutineDeliveryPort {
  readonly channel: RoutineChannel;
  deliver(userId: string, content: string): Promise<boolean>;
}
