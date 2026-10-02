<script lang="ts">
  import Accordion from '$lib/holocene/accordion/accordion.svelte';
  import TableHeaderRow from '$lib/holocene/table/table-header-row.svelte';
  import TableRow from '$lib/holocene/table/table-row.svelte';
  import Table from '$lib/holocene/table/table.svelte';
  import { translate } from '$lib/i18n/translate';
  import { Badge } from '$lib/io/badge';
  import { BadgeCount } from '$lib/io/badge-count';
  import type { ChannelSubscription } from '$lib/types/channels';

  let {
    channelSubscriptions,
  }: { channelSubscriptions: ChannelSubscription[] } = $props();
</script>

{#if channelSubscriptions.length}
  <section>
    <Accordion
      title={translate('workflows.notification-channels')}
      data-testid="channel-subscriptions"
      open
    >
      {#snippet summary()}
        <BadgeCount value={channelSubscriptions.length} />
      {/snippet}
      <Table>
        {#snippet headers()}
          <TableHeaderRow>
            <th>{translate('workflows.channel')}</th>
            <th>{translate('workflows.channel-kind')}</th>
            <th class="text-right">{translate('workflows.last-counter')}</th>
            <th class="text-right">{translate('workflows.pending-counter')}</th>
            <th class="text-right">
              {translate('workflows.scheduled-counter')}
            </th>
            <th class="text-right">{translate('workflows.listeners')}</th>
            <th class="text-right">{translate('workflows.retained')}</th>
          </TableHeaderRow>
        {/snippet}
        {#each channelSubscriptions as subscription (`${subscription.kind}:${subscription.channel}`)}
          <TableRow data-testid="channel-subscription-row">
            <td class="font-mono text-sm">{subscription.channel}</td>
            <td>
              <Badge
                text={subscription.kind}
                colorScheme={subscription.kind === 'Linked'
                  ? 'info'
                  : 'neutral'}
              />
            </td>
            <td class="text-right font-mono text-sm">
              {subscription.lastCounter}
            </td>
            <td class="text-right font-mono text-sm">
              {subscription.pendingCounter ?? ''}
            </td>
            <td class="text-right font-mono text-sm">
              {subscription.scheduledCounter}
            </td>
            <td class="text-right font-mono text-sm">
              {subscription.listenerCount}
            </td>
            <td class="text-right font-mono text-sm">
              {subscription.retainedCount}
            </td>
          </TableRow>
        {/each}
      </Table>
    </Accordion>
  </section>
{/if}
