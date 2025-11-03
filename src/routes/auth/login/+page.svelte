<script lang="ts">
	import { goto } from '$app/navigation';
	
	let email = '';
	let password = '';
	let error = '';
	let loading = false;
	
	async function handleSubmit() {
		if (!email || !password) {
			error = 'Заполните все поля';
			return;
		}
		
		loading = true;
		error = '';
		
		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password })
			});
			
			const data = await response.json();
			
			if (data.success) {
				// Успешный вход
				goto('/game');
			} else {
				error = data.error || 'Ошибка входа';
			}
		} catch (err) {
			error = 'Произошла ошибка. Попробуйте снова.';
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Вход | Elder Scrolls: Автоприключения</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center p-4 bg-bg-secondary">
	<div class="max-w-md w-full">
		<!-- Заголовок -->
		<div class="text-center mb-8">
			<div class="text-5xl mb-4">🗝️</div>
			<h1 class="text-3xl font-bold mb-2 text-text-primary">Вход в игру</h1>
			<p class="text-text-secondary">Ваши приключения ждут!</p>
		</div>
		
		<!-- Форма -->
		<div class="parchment p-8">
			<form on:submit|preventDefault={handleSubmit} class="space-y-6">
				<!-- Email -->
				<div>
					<label for="email" class="block text-text-primary font-medium mb-2 text-sm">
						Email
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
						Пароль
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
					{loading ? 'Вход...' : 'Войти'}
				</button>
			</form>
			
			<!-- Ссылка на регистрацию -->
			<div class="mt-6 text-center">
				<p class="text-text-secondary text-sm">
					Нет аккаунта? 
					<a href="/auth/register" class="text-accent-primary hover:text-accent-secondary font-medium underline">
						Зарегистрироваться
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

