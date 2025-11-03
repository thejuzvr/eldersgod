<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	const emojis = ['⚔️', '🛡️', '💰', '🔥', '⭐', '🏆'];
	const shuffledPairs = [...emojis, ...emojis].sort(() => Math.random() - 0.5);
	
	let revealed: number[] = [];
	let matched: number[] = [];
	let result: 'none' | 'correct' | 'wrong' = 'none';
	let attempts = 0;
	const maxAttempts = 15;
	
	function handleCardClick(index: number) {
		if (result !== 'none') return;
		if (revealed.includes(index)) return;
		if (matched.includes(index)) return;
		if (revealed.length >= 2) return;
		
		revealed = [...revealed, index];
		
		if (revealed.length === 2) {
			attempts++;
			setTimeout(() => {
				const [first, second] = revealed;
				if (shuffledPairs[first] === shuffledPairs[second]) {
					matched = [...matched, first, second];
					
					// Проверка победы
					if (matched.length === shuffledPairs.length) {
						result = 'correct';
						const reward = { exp: 100, gold: 50 };
						dispatch('win', { reward });
					}
				} else if (attempts >= maxAttempts) {
					result = 'wrong';
					dispatch('lose');
				}
				revealed = [];
			}, 800);
		}
	}
	
	function handleClose() {
		dispatch('close');
	}
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
	<div class="parchment max-w-md w-full p-6 shadow-lg">
		<h2 class="text-2xl font-semibold text-center mb-4 text-text-primary">🧩 Память</h2>
		
		<p class="text-text-secondary text-center mb-4 text-sm">
			Найдите все пары за {maxAttempts} попыток!
		</p>
		
		{#if result === 'none'}
			<div class="mb-4">
				<div class="grid grid-cols-4 gap-2 mb-3">
					{#each shuffledPairs as emoji, index}
						<button
							class="aspect-square p-3 rounded border-2 transition-all text-2xl font-bold"
							class:border-border-medium={!revealed.includes(index) && !matched.includes(index)}
							class:border-accent-primary={revealed.includes(index)}
							class:border-success={matched.includes(index)}
							class:bg-bg-secondary={!revealed.includes(index) && !matched.includes(index)}
							class:bg-accent-primary={revealed.includes(index)}
							class:bg-success={matched.includes(index)}
							class:text-bg-primary={revealed.includes(index) || matched.includes(index)}
							on:click={() => handleCardClick(index)}
							disabled={revealed.includes(index) || matched.includes(index) || result !== 'none'}
						>
							{#if revealed.includes(index) || matched.includes(index)}
								{emoji}
							{:else}
								?
							{/if}
						</button>
					{/each}
				</div>
				
				<div class="text-center">
					<p class="text-xs text-text-muted">
						Попыток: {attempts} / {maxAttempts} | Найдено: {matched.length / 2} / {emojis.length}
					</p>
				</div>
			</div>
		{/if}
		
		{#if result === 'correct'}
			<div class="p-3 bg-success bg-opacity-10 border border-success rounded mb-4">
				<p class="text-success font-semibold text-center text-sm">
					✅ Отлично! Все пары найдены!
				</p>
				<p class="text-center text-text-secondary text-xs mt-2">+100 опыта, +50 золота</p>
			</div>
		{:else if result === 'wrong'}
			<div class="p-3 bg-danger bg-opacity-10 border border-danger rounded mb-4">
				<p class="text-danger font-semibold text-center text-sm">
					❌ Попытки закончились!
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

