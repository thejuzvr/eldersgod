<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	const thoughts = [
		'Я хочу сыр...',
		'Почему облака не падают?',
		'Мой хвост чешется',
		'Люди вкусно пахнут',
		'Надо бы подстричь когти',
		'Где мой медовый шлем?'
	];
	
	const correctThought = thoughts[Math.floor(Math.random() * thoughts.length)];
	let selectedThought = '';
	let result: 'none' | 'correct' | 'wrong' = 'none';
	
	function handleSelect(thought: string) {
		if (result !== 'none') return;
		
		selectedThought = thought;
		
		if (thought === correctThought) {
			result = 'correct';
			dispatch('win', { reward: { exp: 100, gold: 50 } });
		} else {
			result = 'wrong';
			dispatch('lose');
		}
	}
	
	function handleClose() {
		dispatch('close');
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
	<div class="parchment max-w-md w-full p-6 shadow-lg">
		<h2 class="text-2xl font-semibold text-center mb-4 text-text-primary">🐉 Угадай мысль дракона</h2>
		
		<p class="text-text-secondary text-center mb-4 text-sm">
			Дракон думает о чём-то... Угадайте!
		</p>
		
		<div class="space-y-2 mb-4">
			{#each thoughts as thought}
				<button
					class="w-full p-3 rounded border-2 transition-all text-sm font-medium"
					class:border-accent-primary={selectedThought === thought && result === 'none'}
					class:border-success={selectedThought === thought && result === 'correct'}
					class:border-danger={selectedThought === thought && result === 'wrong'}
					class:border-border-medium={selectedThought !== thought}
					class:bg-success={selectedThought === thought && result === 'correct'}
					class:bg-danger={selectedThought === thought && result === 'wrong'}
					class:bg-bg-secondary={result === 'none'}
					class:text-bg-primary={selectedThought === thought && result !== 'none'}
					class:text-text-primary={!(selectedThought === thought && result !== 'none')}
					class:opacity-50={result !== 'none' && selectedThought !== thought}
					on:click={() => handleSelect(thought)}
					disabled={result !== 'none'}
				>
					{thought}
				</button>
			{/each}
		</div>
		
		{#if result === 'correct'}
			<div class="p-3 bg-success bg-opacity-10 border border-success rounded mb-4">
				<p class="text-success font-semibold text-center text-sm">
					✅ Правильно! Дракон доволен!
				</p>
				<p class="text-center text-text-secondary text-xs mt-2">+100 опыта, +50 золота</p>
			</div>
		{:else if result === 'wrong'}
			<div class="p-3 bg-danger bg-opacity-10 border border-danger rounded mb-4">
				<p class="text-danger font-semibold text-center text-sm">
					❌ Не угадали! Дракон грустит...
				</p>
			</div>
		{/if}
		
		{#if result !== 'none'}
			<button class="btn w-full" on:click={handleClose}>
				Закрыть
			</button>
		{/if}
	</div>
</div>

