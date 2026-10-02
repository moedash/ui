import { mapValues } from 'es-toolkit';

import type {
  ChannelSubscription,
  ChannelSubscriptionInfo,
} from '$lib/types/channels';
import type {
  Callbacks,
  PendingActivity,
  PendingActivityInfo,
  PendingActivityState,
  PendingChildren,
  PendingNexusOperation,
} from '$lib/types/events';
import type { Callback } from '$lib/types/nexus';
import type {
  DecodedWorkflowSearchAttributes,
  ListWorkflowExecutionsResponse,
  MostRecentWorkflowVersionStamp,
  WorkflowExecution,
  WorkflowExecutionAPIResponse,
  WorkflowSearchAttributes,
} from '$lib/types/workflows';
import { parseRawPayloadToJSON } from '$lib/utilities/decode-payload';
import {
  toCallbackStateReadable,
  toChannelKindReadable,
  toPendingActivityStateReadable,
  toPendingNexusOperationStateReadable,
  toWorkflowStatusReadable,
} from '$lib/utilities/screaming-enums';
import { writeActionsAreAllowed } from '$lib/utilities/write-actions-are-allowed';

import { simplifyAttributes } from './event-history/simplify-attributes';

export const toPendingActivities = (
  pendingActivity: PendingActivityInfo[] = [],
): PendingActivity[] => {
  return pendingActivity.map((activity): PendingActivity => {
    const attributes = simplifyAttributes(activity, true);
    const id = activity.activityId;
    const state = activity.state as unknown as PendingActivityState;
    return {
      ...attributes,
      id,
      state: toPendingActivityStateReadable(state),
    };
  });
};

const toPendingNexusOperations = (
  operations?: PendingNexusOperation[],
): PendingNexusOperation[] => {
  if (!operations) return [];
  return operations.map((operation): PendingNexusOperation => {
    return {
      ...operation,
      state: toPendingNexusOperationStateReadable(operation.state ?? undefined),
    };
  });
};

const toCallbacks = (callbacks?: Callbacks): Callback[] => {
  if (!callbacks) return [];
  return callbacks.map((callback): Callback => {
    return {
      ...callback,
      blockedReason: callback.blockedReason ?? undefined,
      callback: (callback.callback ?? undefined) as Callback['callback'],
      state: toCallbackStateReadable(callback.state ?? undefined),
    };
  });
};

// A missing counter is the proto default of zero. The pending counter stays
// undefined when no notification waits, so the UI can leave the cell blank.
export const toChannelSubscriptions = (
  subscriptions?: ChannelSubscriptionInfo[] | null,
): ChannelSubscription[] => {
  if (!subscriptions) return [];
  return subscriptions.map((subscription): ChannelSubscription => {
    const pending = subscription.pendingNotification;
    return {
      channel: subscription.channel ?? '',
      kind: toChannelKindReadable(subscription.kind),
      subscribedEventId: String(subscription.subscribedEventId ?? 0),
      lastCounter: String(subscription.lastCounter ?? 0),
      pendingCounter: pending ? String(pending.counter ?? 0) : undefined,
      scheduledCounter: String(subscription.scheduledCounter ?? 0),
      listenerCount: subscription.listenerCount ?? 0,
      retainedCount: subscription.retainedCount ?? 0,
      acceptedCount: String(subscription.acceptedCount ?? 0),
    };
  });
};

const toSearchAttributes = (
  apiSearchAttributes: WorkflowSearchAttributes,
): DecodedWorkflowSearchAttributes => {
  if (!apiSearchAttributes || !apiSearchAttributes.indexedFields) return {};
  const decoded = mapValues(apiSearchAttributes.indexedFields, (payload) =>
    parseRawPayloadToJSON(payload),
  ) as Record<string, string>;

  return {
    indexedFields: decoded,
  };
};

const getStartDelay = ({
  executionTime,
  startTime,
}: {
  executionTime: string;
  startTime: string;
}): string | undefined => {
  if (!executionTime || !startTime) return undefined;
  const delayMs =
    new Date(executionTime).getTime() - new Date(startTime).getTime();
  if (delayMs > 0) {
    return Math.round(delayMs / 1000) + 's';
  }
  return undefined;
};

export const toWorkflowExecution = (
  response?: WorkflowExecutionAPIResponse,
): WorkflowExecution => {
  const info = response?.workflowExecutionInfo;
  const searchAttributes = toSearchAttributes(info?.searchAttributes ?? {});
  const memo = info?.memo ?? {};
  const name = info?.type?.name ?? '';
  const id = info?.execution?.workflowId ?? '';
  const runId = info?.execution?.runId ?? '';
  const startTime = info?.startTime ?? '';
  const endTime = info?.closeTime ?? '';
  const executionTime = info?.executionTime ?? '';
  const status = toWorkflowStatusReadable(info?.status ?? null);
  const isRunning = status === 'Running';
  const isPaused = status === 'Paused';
  const historyEvents = info?.historyLength ?? '';
  const historySizeBytes = info?.historySizeBytes ?? '';
  const url = `/workflows/${id}/${runId}`;
  const taskQueue =
    response?.executionConfig?.taskQueue?.name ||
    response?.workflowExecutionInfo?.taskQueue ||
    undefined;
  const mostRecentWorkerVersionStamp = (response?.workflowExecutionInfo
    ?.mostRecentWorkerVersionStamp ?? undefined) as
    | MostRecentWorkflowVersionStamp
    | undefined;
  const assignedBuildId =
    response?.workflowExecutionInfo?.assignedBuildId ?? undefined;
  const parentNamespaceId =
    response?.workflowExecutionInfo?.parentNamespaceId ?? undefined;
  const parent = response?.workflowExecutionInfo?.parentExecution ?? undefined;
  const stateTransitionCount = info?.stateTransitionCount ?? '';
  const defaultWorkflowTaskTimeout =
    response?.executionConfig?.defaultWorkflowTaskTimeout ?? undefined;
  const workflowExecutionTimeout =
    response?.executionConfig?.workflowExecutionTimeout ?? undefined;
  const pendingActivities: PendingActivity[] = toPendingActivities(
    response?.pendingActivities ?? [],
  );
  const pendingChildren: PendingChildren[] = response?.pendingChildren ?? [];
  const pendingNexusOperations: PendingNexusOperation[] =
    toPendingNexusOperations(response?.pendingNexusOperations);
  const pendingWorkflowTask = response?.pendingWorkflowTask ?? undefined;
  const callbacks = toCallbacks(response?.callbacks);
  const channelSubscriptions = toChannelSubscriptions(
    response?.channelSubscriptions,
  );
  const rootExecution = info?.rootExecution ?? undefined;
  const versioningInfo = info?.versioningInfo ?? undefined;
  const priority = info?.priority ?? undefined;
  const workflowExtendedInfo = response?.workflowExtendedInfo ?? {};
  const startDelay = getStartDelay({ executionTime, startTime });
  const externalPayloadCount = info?.externalPayloadCount ?? undefined;
  const externalPayloadSizeBytes = info?.externalPayloadSizeBytes ?? undefined;

  let summary;
  let details;
  if (response?.executionConfig?.userMetadata) {
    summary = response?.executionConfig?.userMetadata?.summary ?? undefined;
    details = response?.executionConfig?.userMetadata?.details ?? undefined;
  }

  return {
    name,
    id,
    runId,
    startTime,
    endTime,
    executionTime,
    status,
    historyEvents,
    historySizeBytes,
    externalPayloadCount,
    externalPayloadSizeBytes,
    searchAttributes,
    memo,
    rootExecution,
    url,
    taskQueue,
    assignedBuildId,
    mostRecentWorkerVersionStamp,
    pendingActivities,
    pendingChildren,
    pendingNexusOperations,
    pendingWorkflowTask,
    callbacks,
    channelSubscriptions,
    versioningInfo,
    priority,
    summary,
    details,
    parentNamespaceId,
    parent,
    stateTransitionCount,
    isRunning,
    isPaused,
    defaultWorkflowTaskTimeout,
    workflowExecutionTimeout,
    workflowExtendedInfo,
    startDelay,
    get canBeTerminated(): boolean {
      return (isRunning || isPaused) && writeActionsAreAllowed();
    },
  };
};

export const toWorkflowExecutions = (
  response: Pick<ListWorkflowExecutionsResponse, 'executions'>,
): WorkflowExecution[] => {
  return (response.executions || []).map((workflowExecutionInfo) =>
    toWorkflowExecution({ workflowExecutionInfo }),
  );
};
