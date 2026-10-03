import type { Payload } from '$lib/types';

// Wire shape of temporal.api.notification.v1.ChannelKind and the messages
// around it, written by hand because the published @temporalio/proto package
// does not carry the notification channel protos.
export type ChannelKind =
  | 'CHANNEL_KIND_UNSPECIFIED'
  | 'CHANNEL_KIND_INDEPENDENT'
  | 'CHANNEL_KIND_LINKED';

export type ExecutionType =
  | 'EXECUTION_TYPE_UNSPECIFIED'
  | 'EXECUTION_TYPE_WORKFLOW'
  | 'EXECUTION_TYPE_ACTIVITY'
  | 'EXECUTION_TYPE_NEXUS_OPERATION';

// The owner of a linked channel. A workflow and a standalone activity are
// told apart by the type, so the id is a business id rather than a workflow id.
export type Execution = {
  type?: ExecutionType | null;
  businessId?: string | null;
  runId?: string | null;
};

export type ChannelNotification = {
  channel?: string | null;
  position?: string | null;
  counter?: string | number | null;
  metadata?: Record<string, Payload> | null;
  linkedTo?: Execution | null;
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
