import type { Payload, WorkflowExecutionInput } from '$lib/types';

// Wire shape of temporal.api.notification.v1.ChannelKind and the messages
// around it, written by hand because the published @temporalio/proto package
// does not carry the notification channel protos.
export type ChannelKind =
  | 'CHANNEL_KIND_UNSPECIFIED'
  | 'CHANNEL_KIND_INDEPENDENT'
  | 'CHANNEL_KIND_LINKED';

export type ChannelNotification = {
  channel?: string | null;
  position?: string | null;
  counter?: string | number | null;
  metadata?: Record<string, Payload> | null;
  linkedTo?: WorkflowExecutionInput | null;
};

export type ChannelSubscriptionInfo = {
  channel?: string | null;
  kind?: ChannelKind | null;
  subscribedEventId?: string | number | null;
  lastCounter?: string | number | null;
  pendingNotification?: ChannelNotification | null;
  scheduledCounter?: string | number | null;
  listenerCount?: number | null;
  retainedCount?: number | null;
  acceptedCount?: string | number | null;
};

export type ChannelSubscriptionKind = 'Unspecified' | 'Independent' | 'Linked';

export type ChannelSubscription = {
  channel: string;
  kind: ChannelSubscriptionKind;
  subscribedEventId: string;
  lastCounter: string;
  pendingCounter?: string;
  scheduledCounter: string;
  listenerCount: number;
  retainedCount: number;
  acceptedCount: string;
};
