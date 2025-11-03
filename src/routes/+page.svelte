<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	
	export let data;
	
	onMount(() => {
		// Если пользователь уже залогинен, перенаправляем на игру
		if (data.user) {
			goto('/game');
		}
	});
	
	function goToLogin() {
		goto('/auth/login');
	}
	
	function goToRegister() {
		goto('/auth/register');
	}
</script>

<svelte:head>
	<title>Elder Scrolls: Автоприключения</title>
</svelte:head>

<div class="min-h-screen flex flex-col items-center justify-center p-4 bg-bg-secondary">
	<div class="max-w-4xl w-full text-center">
		<!-- Заголовок -->
		<div class="mb-12 fade-in-up">
			<div class="text-6xl mb-6">⚔️</div>
			<h1 class="text-4xl font-bold mb-4 text-text-primary">
				Elder Scrolls: Автоприключения
			</h1>
			<p class="text-lg text-text-secondary mb-6">
				В мире, где драконы пекут кексы, а носки телепортируются
			</p>
		</div>
		
		<!-- Описание -->
		<div class="parchment p-8 mb-8 fade-in-up">
			<p class="text-base mb-4 text-text-primary leading-relaxed">
				Добро пожаловать в абсурдный мир Тамриэля! Здесь герои сражаются с кексами-драконами,
				дружат с грибами-философами и находят носки-телепорты.
			</p>
			<p class="text-sm text-text-secondary leading-relaxed">
				Ваш герой автоматически переживает приключения, а вы наблюдаете за его невероятными
				подвигами в дневнике событий. Кликайте на интерактивные события, чтобы влиять на судьбу!
			</p>
		</div>
		
		<!-- Фичи -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
			<div class="panel text-center fade-in-up">
				<div class="text-4xl mb-3">🐉</div>
				<h3 class="text-lg font-semibold mb-2 text-text-primary">Абсурдные события</h3>
				<p class="text-text-secondary text-sm">50+ уникальных событий полных юмора и безумия</p>
			</div>
			
			<div class="panel text-center fade-in-up">
				<div class="text-4xl mb-3">⚔️</div>
				<h3 class="text-lg font-semibold mb-2 text-text-primary">Арена PvP</h3>
				<p class="text-text-secondary text-sm">Сражайтесь с героями других игроков!</p>
			</div>
			
			<div class="panel text-center fade-in-up">
				<div class="text-4xl mb-3">🎮</div>
				<h3 class="text-lg font-semibold mb-2 text-text-primary">Автоигра</h3>
				<p class="text-text-secondary text-sm">События происходят автоматически, просто наблюдайте!</p>
			</div>
		</div>
		
		<!-- Кнопки -->
		<div class="flex flex-col md:flex-row gap-4 justify-center fade-in-up">
			<button class="btn text-base py-3 px-8 btn-interactive" on:click={goToRegister}>
				🎲 Начать Приключение
			</button>
			<button class="btn text-base py-3 px-8" on:click={goToLogin}>
				🗝️ Войти
			</button>
		</div>
		
		<!-- Цитата -->
		<div class="mt-12 hero-thought max-w-2xl mx-auto">
			<span class="text-sm">
				"О Великий! Я видел дракона... он продавал мёд! Это лучший день в моей жизни!"
			</span>
		</div>
	</div>
</div>
