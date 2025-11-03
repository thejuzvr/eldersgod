<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	const targetNumber = Math.floor(Math.random() * 10) + 1;
	let guesses: number[] = [];
	let currentGuess = '';
	let result: 'none' | 'correct' | 'wrong' = 'none';
	let attempts = 0;
	const maxAttempts = 3;
	
	function handleGuess() {
		const guess = parseInt(currentGuess);
		if (isNaN(guess) || guess < 1 || guess > 10) return;
		
		attempts++;
		guesses = [...guesses, guess];
		
		if (guess === targetNumber) {
			result = 'correct';
			const reward = { exp: 75, gold: 30 };
			dispatch('win', { reward });
		} else if (attempts >= maxAttempts) {
			result = 'wrong';
			dispatch('lose');
		}
		
		currentGuess = '';
	}
	
	function handleClose() {
		dispatch('close');
	}
	
	$: hint = guesses.length > 0 ? (guesses[guesses.length - 1] < targetNumber ? '☝️ Больше!' : '👇 Меньше!') : '';
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
	<div class="parchment max-w-md w-full p-6 shadow-lg">
		<h2 class="text-2xl font-semibold text-center mb-4 text-text-primary">🎲 Угадай число</h2>
		
		<p class="text-text-secondary text-center mb-4 text-sm">
			Я загадал число от 1 до 10. У вас {maxAttempts} попытки!
		</p>
		
		{#if result === 'none'}
			<div class="mb-4">
				<div class="flex gap-2">
					<input
						type="number"
						bind:value={currentGuess}
						min="1"
						max="10"
						placeholder="Введите число..."
						class="flex-1 px-4 py-2 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
						on:keypress={(e) => e.key === 'Enter' && handleGuess()}
					/>
					<button 
						class="btn btn-interactive" 
						on:click={handleGuess}
						disabled={!currentGuess}
					>
						Угадать
					</button>
				</div>
				
				<div class="mt-3 text-center">
					<p class="text-xs text-text-muted">Попыток: {attempts} / {maxAttempts}</p>
					{#if hint}
						<p class="text-sm font-medium text-warning mt-2">{hint}</p>
					{/if}
				</div>
				
				{#if guesses.length > 0}
					<div class="mt-3">
						<p class="text-xs text-text-muted mb-1">Ваши попытки:</p>
						<div class="flex gap-2 justify-center">
							{#each guesses as guess}
								<span class="px-3 py-1 bg-bg-secondary rounded text-sm font-medium text-text-primary">
									{guess}
								</span>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/if}
		
		{#if result === 'correct'}
			<div class="p-3 bg-success bg-opacity-10 border border-success rounded mb-4">
				<p class="text-success font-semibold text-center text-sm">
					✅ Правильно! Это было {targetNumber}!
				</p>
				<p class="text-center text-text-secondary text-xs mt-2">+75 опыта, +30 золота</p>
			</div>
		{:else if result === 'wrong'}
			<div class="p-3 bg-danger bg-opacity-10 border border-danger rounded mb-4">
				<p class="text-danger font-semibold text-center text-sm">
					❌ Не угадали! Это было {targetNumber}
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

