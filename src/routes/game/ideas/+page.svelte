<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	
	export let data;
	
	let category = 'event';
	let subject = '';
	let ideaText = '';
	let submitting = false;
	let submitted = false;
	let error = '';
	
	const categories = [
		{ value: 'event', label: 'событие' },
		{ value: 'bug', label: 'исправить ошибку' },
		{ value: 'idea', label: 'отличную идею' },
		{ value: 'monster', label: 'монстра' },
		{ value: 'item', label: 'трофей' },
		{ value: 'location', label: 'весть с полей' },
		{ value: 'phrase', label: 'фразу в дневник' },
		{ value: 'quest', label: 'задание (квест)' },
		{ value: 'equipment', label: 'снаряжение' },
		{ value: 'diary', label: 'хронику дуэли' },
		{ value: 'underground', label: 'хронику подземелья' },
		{ value: 'dungeon', label: 'хронику заплыва' },
		{ value: 'newspaper', label: 'текст для газеты' }
	];
	
	async function handleSubmit() {
		if (!subject.trim() || !ideaText.trim()) {
			error = 'Пожалуйста, заполните все поля';
			return;
		}
		
		submitting = true;
		error = '';
		
		try {
			const response = await fetch('/api/ideas/submit', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					heroId: data.hero.id,
					category,
					subject,
					content: ideaText
				})
			});
			
			const result = await response.json();
			
			if (result.success) {
				submitted = true;
				// Сброс формы
				setTimeout(() => {
					category = 'event';
					subject = '';
					ideaText = '';
					submitted = false;
				}, 3000);
			} else {
				error = result.error || 'Ошибка отправки';
			}
		} catch (err) {
			error = 'Произошла ошибка. Попробуйте снова.';
		} finally {
			submitting = false;
		}
	}
</script>

<svelte:head>
	<title>Ящик идей | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center" class="space-y-4">
		<div class="panel max-w-2xl mx-auto">
			<div class="text-center mb-6">
				<div class="text-5xl mb-3">💡</div>
				<h1 class="text-2xl font-bold text-text-primary mb-2">Нижний ящик</h1>
				<p class="text-sm text-text-secondary">
					Дорогая редакция, я хочу предложить:
				</p>
			</div>
			
			<form on:submit|preventDefault={handleSubmit} class="space-y-4">
				<!-- Категория -->
				<div>
					<label for="category" class="block text-sm font-medium text-text-primary mb-2">
						Выберите категорию:
					</label>
					<select
						id="category"
						bind:value={category}
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
					>
						{#each categories as cat}
							<option value={cat.value}>{cat.label}</option>
						{/each}
					</select>
				</div>
				
				<!-- Тема -->
				<div>
					<label for="subject" class="block text-sm font-medium text-text-primary mb-2">
						Краткая тема (необязательно):
					</label>
					<input
						type="text"
						id="subject"
						bind:value={subject}
						placeholder="Например: Дракон-пекарь"
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none"
					/>
				</div>
				
				<!-- Текст идеи -->
				<div>
					<label for="idea" class="block text-sm font-medium text-text-primary mb-2">
						Ваша идея:
					</label>
					<textarea
						id="idea"
						bind:value={ideaText}
						rows="8"
						placeholder="Если другие разделы ящика не подходят, отправьте идею сюда."
						class="w-full px-4 py-2.5 rounded border border-border-medium bg-bg-primary text-text-primary focus:border-accent-primary focus:outline-none resize-none"
						required
					></textarea>
					<p class="text-xs text-text-muted mt-2 italic">
						Пожалуйста, учитывайте, что мы не можем лично ответить на все сообщения.
					</p>
				</div>
				
				<!-- Сообщения -->
				{#if submitted}
					<div class="p-3 bg-success bg-opacity-10 border border-success rounded">
						<p class="text-success text-sm font-medium text-center">
							✅ Идея отправлена! Спасибо за вклад в развитие игры!
						</p>
					</div>
				{/if}
				
				{#if error}
					<div class="p-3 bg-danger bg-opacity-10 border border-danger rounded">
						<p class="text-danger text-sm font-medium text-center">{error}</p>
					</div>
				{/if}
				
				<!-- Кнопка отправки -->
				<button
					type="submit"
					class="btn w-full btn-interactive py-3"
					disabled={submitting || !ideaText.trim()}
				>
					{submitting ? 'Отправка...' : 'Отправить в ящик'}
				</button>
			</form>
			
			<!-- Дополнительные ссылки -->
			<div class="mt-6 pt-6 border-t border-border-light space-y-2">
				<a href="/game/wiki" class="text-sm text-accent-primary hover:text-accent-secondary underline block text-center">
					📖 Памятка креативщику
				</a>
				<button type="button" class="text-sm text-accent-primary hover:text-accent-secondary underline block text-center w-full">
					📝 Переменные (для разработчиков)
				</button>
				<a href="/game" class="text-sm text-text-muted hover:text-text-secondary underline block text-center">
					← Вернуться к игре
				</a>
			</div>
		</div>
	</div>
</GameLayout>

