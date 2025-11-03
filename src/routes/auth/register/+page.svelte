<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let confirmPassword = '';
	let heroName = '';
	let heroRace = 'Nord';
	let error = '';
	let loading = false;
	
	const races = [
		'Nord', 'Dark Elf', 'High Elf', 'Wood Elf', 
		'Khajiit', 'Argonian', 'Breton', 'Imperial', 'Redguard', 'Orc'
	];
	
	async function handleSubmit() {
		if (!email || !password || !heroName) {
			error = 'Заполните все обязательные поля';
			return;
		}
		
		if (password !== confirmPassword) {
			error = 'Пароли не совпадают';
			return;
		}
		
		if (password.length < 6) {
			error = 'Пароль должен быть не менее 6 символов';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password, heroName, heroRace })
			});
			
			const data = await response.json();
			
			if (data.success) {
				// Успешная регистрация
				goto('/game');
			} else {
				error = data.error || 'Ошибка регистрации';
			}
		} catch (err) {
			error = 'Произошла ошибка. Попробуйте снова.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Регистрация | Elder Scrolls: Автоприключения</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-bg-secondary">
	<div class="max-w-md w-full">
		<!-- Заголовок -->
		<div class="text-center mb-8">
			<div class="text-5xl mb-4">🎲</div>
			<h1 class="text-3xl font-bold mb-2 text-text-primary">Создание героя</h1>
			<p class="text-text-secondary">Начните своё приключение!</p>
		</div>
		
		<!-- Форма -->
		<div class="parchment p-8">
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Email -->
				<div>
					<label for="email" class="block text-text-primary font-medium mb-2 text-sm">
						Email *
					</label>
					<input
						type="email"
						id="email"
						bind:value={email}
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
						placeholder="hero@tamriel.com"
						required
					/>
				</div>
				
				<!-- Пароль -->
				<div>
					<label for="password" class="block text-text-primary font-medium mb-2 text-sm">
						Пароль *
					</label>
					<input
						type="password"
						id="password"
						bind:value={password}
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
						placeholder="••••••••"
						required
					/>
				</div>
				
				<!-- Подтверждение пароля -->
				<div>
					<label for="confirmPassword" class="block text-text-primary font-medium mb-2 text-sm">
						Подтвердите пароль *
					</label>
					<input
						type="password"
						id="confirmPassword"
						bind:value={confirmPassword}
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
						placeholder="••••••••"
						required
					/>
				</div>
				
				<!-- Имя героя -->
				<div>
					<label for="heroName" class="block text-text-primary font-medium mb-2 text-sm">
						Имя героя *
					</label>
					<input
						type="text"
						id="heroName"
						bind:value={heroName}
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
						placeholder="Вориан, Азура, Шеогорат..."
						required
					/>
				</div>
				
				<!-- Раса -->
				<div>
					<label for="race" class="block text-text-primary font-medium mb-2 text-sm">
						Раса
					</label>
					<select
						id="race"
						bind:value={heroRace}
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none custom-select"
					>
						{#each races as race}
							<option value={race}>{race}</option>
						{/each}
					</select>
				</div>
				
				<!-- Ошибка -->
				{#if error}
					<div class="p-3 bg-danger bg-opacity-10 border border-danger rounded">
						<p class="text-danger text-sm font-medium">{error}</p>
					</div>
				{/if}
				
				<!-- Кнопка -->
				<button 
					type="submit" 
					class="btn w-full btn-interactive py-3"
					disabled={loading}
				>
					{loading ? 'Создание героя...' : '⚔️ Создать героя'}
				</button>
			</form>
			
			<!-- Ссылка на вход -->
			<div class="mt-6 text-center">
				<p class="text-text-secondary text-sm">
					Уже есть аккаунт? 
					<a href="/auth/login" class="text-accent-primary hover:text-accent-secondary font-medium underline">
						Войти
					</a>
				</p>
			</div>
			
			<!-- Назад -->
			<div class="mt-4 text-center">
				<a href="/" class="text-text-muted hover:text-text-secondary text-sm underline">
					← Вернуться на главную
				</a>
			</div>
		</div>
	</div>
</div>

<style>
	.custom-select {
		appearance: none;
		background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23495057' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		background-size: 1.5em;
	}
</style>

