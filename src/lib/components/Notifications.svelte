<script lang="ts">
  import { notificationsStore, markNotificationAsRead } from '$lib/stores/gameStore';
  import { fade, slide } from 'svelte/transition';

  let notifications = $notificationsStore;

  $: notifications = $notificationsStore;

  function removeNotification(id: string) {
    markNotificationAsRead(id);
    notificationsStore.update(n => n.filter(item => item.id !== id));
  }
</script>

<div class="fixed top-16 right-4 z-50 flex flex-col gap-2 pointer-events-none w-80">
  {#each notifications.slice(0, 5) as notification (notification.id)}
    <div
      role="button"
      tabindex="0"
      class="pointer-events-auto p-4 rounded-lg shadow-lg border relative flex items-start gap-3 transition-colors cursor-pointer"
      class:bg-bg-tertiary={notification.type === 'info'}
      class:border-border-medium={notification.type === 'info'}
      class:bg-success={notification.type === 'success'}
      class:bg-opacity-20={notification.type === 'success'}
      class:border-success={notification.type === 'success'}
      class:bg-danger={notification.type === 'error'}
      class:border-danger={notification.type === 'error'}
      class:text-danger={notification.type === 'error'}
      in:slide={{ duration: 300 }}
      out:fade={{ duration: 200 }}
      on:click={() => removeNotification(notification.id)}
      on:keydown={(e) => e.key === 'Enter' && removeNotification(notification.id)}
    >
      <div class="flex-1">
        <h4 class="text-sm font-semibold mb-1"
          class:text-text-primary={notification.type !== 'error'}
          class:text-success={notification.type === 'success'}>
          {notification.title}
        </h4>
        <p class="text-xs text-text-secondary">{notification.message}</p>
      </div>
      <button class="opacity-50 hover:opacity-100 text-xs mt-0.5" on:click|stopPropagation={() => removeNotification(notification.id)}>
        ✕
      </button>
    </div>
  {/each}
</div>
