<script lang="ts">
	import EventCard from './EventCard.svelte';
	import { onMount } from 'svelte';
	
	export let events: any[] = [];
	
	let scrollContainer: HTMLElement;
	let userScrolledUp = false;
	let previousEventsLength = 0;
	
	// Проверяем, прокручен ли пользователь от верха
	function handleScroll() {
		if (!scrollContainer) return;
		
		const { scrollTop } = scrollContainer;
		const isAtTop = scrollTop < 50; // В пределах 50px от верха
		
		userScrolledUp = !isAtTop;
	}
	
	// Auto-scroll при добавлении новых событий ТОЛЬКО если пользователь не прокручен вниз
	// Теперь новые события сверху, поэтому скроллим вверх
	$: if (events.length > previousEventsLength && scrollContainer && !userScrolledUp) {
		previousEventsLength = events.length;
		setTimeout(() => {
			scrollContainer.scrollTop = 0;
		}, 100);
	}
	
	// Инициализируем длину при первой загрузке
	$: if (events.length > 0 && previousEventsLength === 0) {
		previousEventsLength = events.length;
	}
	
	function handleInteract(eventData: CustomEvent) {
		console.log('Interaction:', eventData.detail);
		// Здесь можно добавить логику для обработки клика
	}
</script>

<div class="panel h-full flex flex-col">
	<div class="mb-4 text-center border-b border-border-light pb-3">
		<h2 class="text-2xl font-semibold text-text-primary">📜 Дневник Приключений</h2>
		<p class="text-xs text-text-muted mt-1">События разворачиваются...</p>
	</div>
	
	<div 
		class="flex-1 overflow-y-auto pr-2"
		bind:this={scrollContainer}
		on:scroll={handleScroll}
	>
		{#if events.length === 0}
			<div class="text-center text-text-muted mt-10">
				<div class="text-5xl mb-4">⏳</div>
				<p class="text-base">Ожидание приключений...</p>
				<p class="text-sm mt-2">Скоро начнётся что-то интересное!</p>
			</div>
		{:else}
			{#each events.slice().reverse() as event (event.id || event.timestamp)}
				<EventCard 
					{event} 
					interactive={event.interactive || false}
					on:interact={handleInteract}
				/>
			{/each}
		{/if}
	</div>
</div>

