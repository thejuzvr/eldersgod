<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import InteractiveButton from './InteractiveButton.svelte';
	
	export let opponents: any[] = [];
	export let inQueue = false;
	
	const dispatch = createEventDispatcher();
	
	function handleJoinQueue() {
		dispatch('joinQueue');
	}
	
	function handleViewBattles() {
		dispatch('viewBattles');
	}
</script>

<div class="panel card-shadow">
	<div class="text-center mb-4 border-b border-border-light pb-3">
		<h2 class="text-xl font-semibold text-text-primary">⚔️ Арена</h2>
		<p class="text-xs text-text-muted mt-1">Сражения с другими героями</p>
	</div>
	
	{#if !inQueue}
		<div class="text-center mb-4">
			<button class="btn w-full btn-interactive" on:click={handleJoinQueue}>
				Встать в очередь
			</button>
		</div>
	{:else}
		<div class="text-center mb-4 p-3 bg-bg-tertiary rounded border border-warning">
			<div class="text-2xl mb-2">⏳</div>
			<p class="text-warning text-sm font-medium">Ищем противника...</p>
		</div>
	{/if}
	
	<!-- Доступные противники -->
	{#if opponents.length > 0}
		<div class="mb-4">
			<h3 class="text-sm font-medium text-text-primary mb-2">Возможные противники:</h3>
			<div class="space-y-2 max-h-64 overflow-y-auto">
				{#each opponents as opponent}
					<div class="p-3 bg-bg-secondary rounded border border-border-light hover:border-border-medium transition-all">
						<div class="flex justify-between items-center">
							<div>
								<div class="font-medium text-text-primary text-sm">{opponent.name}</div>
								<div class="text-xs text-text-muted">{opponent.title}</div>
							</div>
							<div class="text-right">
								<div class="text-xs text-text-muted">Уровень</div>
								<div class="text-lg font-semibold text-text-primary">{opponent.level}</div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-center text-text-muted py-6">
			<p class="text-sm">Нет доступных противников</p>
			<p class="text-xs mt-2">Встаньте в очередь!</p>
		</div>
	{/if}
	
	<!-- История боёв -->
	<div class="mt-4 pt-4 border-t border-border-light">
		<button class="btn w-full" on:click={handleViewBattles}>
			История боёв
		</button>
	</div>
</div>
