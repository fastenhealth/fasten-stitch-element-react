import { EventTypes } from '../constants';

export interface MessageBusEventPayload {
  event_type: EventTypes;
  data?: unknown;
}
