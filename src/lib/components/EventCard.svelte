<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let event: any;
	export let interactive = false;
	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		if (interactive) {
			dispatch('interact', { event });
		}
	}
	
	function formatTimestamp(timestamp: string | Date | undefined) {
		if (!timestamp) return null;
		
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffMins = Math.floor(diffMs / 60000);
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		
		// Если меньше минуты
		if (diffMins < 1) {
			return 'только что';
		}
		// Если меньше часа
		if (diffMins < 60) {
			return `${diffMins} мин. назад`;
		}
		// Если меньше дня
		if (diffHours < 24) {
			return `${diffHours} ч. назад`;
		}
		// Если меньше недели
		if (diffDays < 7) {
			return `${diffDays} дн. назад`;
		}
		// Иначе полная дата
		return date.toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<div class="event-card fade-in-up">
	<div class="flex items-start gap-3">
		<!-- Иконка события -->
		{#if event.icon}
			<div class="text-3xl flex-shrink-0">
				{event.icon}
			</div>
		{/if}
		
		<div class="flex-1">
			<!-- Заголовок и время -->
			<div class="flex items-start justify-between mb-2">
				<h3 class="text-base font-semibold text-text-primary">
					{event.title}
				</h3>
				{#if event.timestamp}
					<span class="text-xs text-text-muted whitespace-nowrap ml-3">
						🕒 {formatTimestamp(event.timestamp)}
					</span>
				{/if}
			</div>
			
			<!-- Описание -->
			<p class="text-text-secondary text-sm mb-3 leading-relaxed">
				{event.description}
			</p>
			
			<!-- Мысль героя -->
			{#if event.thought}
				<div class="hero-thought">
					<span class="ml-6">"{event.thought}"</span>
				</div>
			{/if}
			
			<!-- Награды -->
			{#if event.rewards}
				<div class="flex flex-wrap gap-2 mt-3">
					{#if event.rewards.exp}
						<div class="flex items-center gap-1.5 text-success text-xs">
							<span>✅</span>
							<span class="font-medium">+{event.rewards.exp} опыта</span>
						</div>
					{/if}
					
					{#if event.rewards.gold}
						<div class="flex items-center gap-1.5 text-xs" class:text-success={event.rewards.gold > 0} class:text-danger={event.rewards.gold < 0}>
							<span>{event.rewards.gold > 0 ? '✅' : '❌'}</span>
							<span class="font-medium">{event.rewards.gold > 0 ? '+' : ''}{event.rewards.gold} золота</span>
						</div>
					{/if}
					
					{#if event.rewards.dragonSouls}
						<div class="flex items-center gap-1.5 text-warning text-xs">
							<span>🔥</span>
							<span class="font-medium">+{event.rewards.dragonSouls} души дракона</span>
						</div>
					{/if}
					
					{#if event.rewards.item}
						<div class="flex items-center gap-1.5 text-info text-xs">
							<span>→</span>
							<span class="font-medium">Новый предмет: "{event.rewards.item.name}"</span>
						</div>
					{/if}
					
					{#if event.rewards.newTitle}
						<div class="flex items-center gap-1.5 text-text-primary text-xs">
							<span>👑</span>
							<span class="font-medium">Новый титул: "{event.rewards.newTitle}"</span>
						</div>
					{/if}
				</div>
			{/if}
			
			<!-- Интерактивная кнопка -->
			{#if interactive}
				<button 
					class="btn btn-interactive cursor-blink mt-4" 
					on:click={handleClick}
				>
					Кликни!
				</button>
			{/if}
		</div>
	</div>
</div>


