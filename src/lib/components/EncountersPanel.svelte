<script lang="ts">
	export let encounters: any[] = [];
</script>

<div class="panel card-shadow h-full flex flex-col">
	<div class="mb-4 text-center border-b border-border-light pb-3">
		<h2 class="text-xl font-semibold text-text-primary">👥 Встречи Героев</h2>
		<p class="text-xs text-text-muted mt-1">Истории с другими путниками</p>
	</div>
	
	<div class="flex-1 overflow-y-auto pr-2">
		{#if encounters.length === 0}
			<div class="text-center text-text-muted mt-10">
				<div class="text-4xl mb-3">🌍</div>
				<p class="text-sm">Встреч пока не было</p>
				<p class="text-xs mt-2">Скоро кто-нибудь появится!</p>
			</div>
		{:else}
			<div class="space-y-2">
				{#each encounters as encounter}
					<div class="p-3 bg-bg-secondary rounded border border-border-light hover:border-border-medium transition-all fade-in-up">
						<div class="flex items-start gap-2">
							<div class="text-2xl">{encounter.icon || '👤'}</div>
							<div class="flex-1">
								<div class="text-xs text-text-muted mb-1">
									{new Date(encounter.timestamp).toLocaleString('ru-RU')}
								</div>
								<p class="text-text-secondary text-sm leading-relaxed">
									{encounter.description}
								</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

