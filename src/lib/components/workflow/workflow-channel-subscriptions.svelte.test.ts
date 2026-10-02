import { flushSync, mount, unmount } from 'svelte';
import { describe, expect, it } from 'vitest';

import type { ChannelSubscription } from '$lib/types/channels';

import WorkflowChannelSubscriptions from './workflow-channel-subscriptions.svelte';

const independent: ChannelSubscription = {
  channel: 'orders',
  kind: 'Independent',
  subscribedEventId: '5',
  lastCounter: '3',
  pendingCounter: '4',
  scheduledCounter: '0',
  listenerCount: 0,
  retainedCount: 0,
  acceptedCount: '0',
};

const linked: ChannelSubscription = {
  channel: 'demo',
  kind: 'Linked',
  subscribedEventId: '0',
  lastCounter: '1',
  pendingCounter: undefined,
  scheduledCounter: '0',
  listenerCount: 2,
  retainedCount: 1,
  acceptedCount: '1',
};

const mountSection = (channelSubscriptions: ChannelSubscription[]) => {
  const target = document.createElement('div');
  document.body.appendChild(target);
  const component = mount(WorkflowChannelSubscriptions, {
    target,
    props: { channelSubscriptions },
  });
  flushSync();
  return {
    target,
    cleanup: () => {
      unmount(component);
      target.remove();
    },
  };
};

const cellsOf = (row: Element): string[] =>
  Array.from(row.querySelectorAll('td')).map(
    (cell) => cell.textContent?.trim() ?? '',
  );

describe('WorkflowChannelSubscriptions', () => {
  it('renders nothing when the workflow stands on no channel', () => {
    const { target, cleanup } = mountSection([]);
    expect(
      target.querySelector('[data-testid="channel-subscriptions"]'),
    ).toBeNull();
    cleanup();
  });

  it('renders a row per subscription with its counters', () => {
    const { target, cleanup } = mountSection([independent, linked]);
    const rows = target.querySelectorAll(
      '[data-testid="channel-subscription-row"]',
    );
    expect(rows).toHaveLength(2);
    expect(cellsOf(rows[0])).toEqual([
      'orders',
      'Independent',
      '3',
      '4',
      '0',
      '0',
      '0',
    ]);
    cleanup();
  });

  it('leaves the pending counter blank when no notification waits', () => {
    const { target, cleanup } = mountSection([linked]);
    const row = target.querySelector(
      '[data-testid="channel-subscription-row"]',
    );
    expect(row).not.toBeNull();
    expect(cellsOf(row as Element)).toEqual([
      'demo',
      'Linked',
      '1',
      '',
      '0',
      '2',
      '1',
    ]);
    cleanup();
  });

  it('titles the section and counts the channels', () => {
    const { target, cleanup } = mountSection([independent, linked]);
    const section = target.querySelector(
      '[data-testid="channel-subscriptions"]',
    );
    expect(section?.textContent).toContain('Notification Channels');
    expect(section?.textContent).toContain('2');
    cleanup();
  });
});
