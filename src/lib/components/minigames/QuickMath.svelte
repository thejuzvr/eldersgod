<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	const num1 = Math.floor(Math.random() * 20) + 1;
	const num2 = Math.floor(Math.random() * 20) + 1;
	const operations = ['+', '-', '*'];
	const operation = operations[Math.floor(Math.random() * operations.length)];
	
	let correctAnswer = 0;
	let userAnswer = '';
	let result: 'none' | 'correct' | 'wrong' = 'none';
	let timeLeft = 15;
	let timer: any;
	
	// Вычисляем правильный ответ
	switch(operation) {
		case '+': correctAnswer = num1 + num2; break;
		case '-': correctAnswer = num1 - num2; break;
		case '*': correctAnswer = num1 * num2; break;
	}
	
	onMount(() => {
		timer = setInterval(() => {
			timeLeft--;
			if (timeLeft <= 0) {
				clearInterval(timer);
				result = 'wrong';
				dispatch('lose');
			}
		}, 1000);
		
		return () => clearInterval(timer);
	});
	
	function handleSubmit() {
		if (result !== 'none') return;
		
		clearInterval(timer);
		const answer = parseInt(userAnswer);
		
		if (answer === correctAnswer) {
			result = 'correct';
			const reward = { exp: 50, gold: 25 };
			dispatch('win', { reward });
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
		<h2 class="text-2xl font-semibold text-center mb-4 text-text-primary">🧮 Быстрая математика</h2>
		
		<p class="text-text-secondary text-center mb-4 text-sm">
			Решите пример за {timeLeft} секунд!
		</p>
		
		{#if result === 'none'}
			<div class="mb-4">
				<div class="text-center mb-4 p-4 bg-bg-secondary rounded">
					<p class="text-3xl font-bold text-text-primary">
						{num1} {operation} {num2} = ?
					</p>
				</div>
				
				<div class="flex gap-2 mb-3">
					<input
						type="number"
						bind:value={userAnswer}
						placeholder="Ваш ответ..."
						class="flex-1 px-4 py-2 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none text-center text-lg"
						on:keypress={(e) => e.key === 'Enter' && handleSubmit()}
						autofocus
					/>
				</div>
				
				<button 
					class="btn btn-interactive w-full" 
					on:click={handleSubmit}
					disabled={!userAnswer}
				>
					Ответить
				</button>
				
				<div class="mt-3 text-center">
					<div class="inline-block px-4 py-2 rounded bg-warning bg-opacity-20 border border-warning">
						<p class="text-warning font-semibold">⏱️ Осталось: {timeLeft}с</p>
					</div>
				</div>
			</div>
		{/if}
		
		{#if result === 'correct'}
			<div class="p-3 bg-success bg-opacity-10 border border-success rounded mb-4">
				<p class="text-success font-semibold text-center text-sm">
					✅ Правильно! {num1} {operation} {num2} = {correctAnswer}
				</p>
				<p class="text-center text-text-secondary text-xs mt-2">+50 опыта, +25 золота</p>
			</div>
		{:else if result === 'wrong'}
			<div class="p-3 bg-danger bg-opacity-10 border border-danger rounded mb-4">
				<p class="text-danger font-semibold text-center text-sm">
					❌ Неверно! Правильный ответ: {correctAnswer}
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

