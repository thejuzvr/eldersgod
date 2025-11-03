<script lang="ts">
	export let quests: any[] = [];
	
	function getProgressPercent(quest: any): number {
		if (!quest.subtasks || quest.subtasks.length === 0) return 0;
		const completed = quest.subtasks.filter((t: any) => t.completed).length;
		return (completed / quest.subtasks.length) * 100;
	}
	
	function getProgressText(quest: any): string {
		if (!quest.subtasks || quest.subtasks.length === 0) return '0/0';
		const completed = quest.subtasks.filter((t: any) => t.completed).length;
		return `${completed}/${quest.subtasks.length}`;
	}
</script>

<div class="panel h-full flex flex-col">
	<div class="mb-4 text-center border-b border-border-light pb-3">
		<h2 class="text-xl font-semibold text-text-primary">📜 Задания</h2>
		<p class="text-xs text-text-muted mt-1">Ваши текущие цели</p>
	</div>
	
	<div class="flex-1 overflow-y-auto pr-2 space-y-3">
		{#if quests.length === 0}
			<div class="text-center text-text-muted mt-10">
				<div class="text-4xl mb-3">📋</div>
				<p class="text-sm">Пока нет активных заданий</p>
				<p class="text-xs mt-2">Скоро появятся новые цели!</p>
			</div>
		{:else}
			{#each quests as quest (quest.id)}
				<div class="p-3 bg-bg-primary border border-border-light rounded hover:border-border-medium transition-all">
					<div class="flex items-start justify-between mb-2">
						<div class="flex-1">
							<h3 class="text-sm font-semibold text-text-primary mb-1">
								{quest.icon || '📝'} {quest.title}
							</h3>
							<p class="text-xs text-text-secondary">{quest.description}</p>
						</div>
						{#if quest.status === 'completed'}
							<span class="text-lg">✅</span>
						{:else if quest.status === 'failed'}
							<span class="text-lg">❌</span>
						{/if}
					</div>
					
					<!-- Прогресс-бар -->
					{#if quest.subtasks && quest.subtasks.length > 0}
						<div class="mt-3">
							<div class="flex justify-between items-center mb-1">
								<span class="text-xs text-text-muted">Прогресс</span>
								<span class="text-xs font-medium text-text-primary">{getProgressText(quest)}</span>
							</div>
							<div class="stat-bar h-2">
								<div 
									class="stat-bar-fill h-full" 
									style="width: {getProgressPercent(quest)}%; background: var(--info);"
								></div>
							</div>
							
							<!-- Подзадания -->
							<div class="mt-2 space-y-1">
								{#each quest.subtasks as subtask}
									<div class="flex items-center gap-2 text-xs">
										<input 
											type="checkbox" 
											checked={subtask.completed} 
											disabled 
											class="w-3 h-3"
										/>
										<span 
											class:text-text-muted={subtask.completed}
											class:line-through={subtask.completed}
											class:text-text-secondary={!subtask.completed}
										>
											{subtask.title}
										</span>
									</div>
								{/each}
							</div>
						</div>
					{/if}
					
					<!-- Награды -->
					{#if quest.rewards}
						<div class="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border-light">
							<span class="text-xs text-text-muted">Награда:</span>
							{#if quest.rewards.exp}
								<span class="text-xs text-success">+{quest.rewards.exp} опыта</span>
							{/if}
							{#if quest.rewards.gold}
								<span class="text-xs text-warning">+{quest.rewards.gold} золота</span>
							{/if}
						</div>
					{/if}
				</div>
			{/each}
		{/if}
	</div>
</div>

