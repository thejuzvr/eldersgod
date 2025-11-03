<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	
	export let data;
	
	const categories = [
		{ id: 'combat', name: 'Боевые', icon: '⚔️', color: 'danger' },
		{ id: 'magic', name: 'Магия', icon: '🔮', color: 'info' },
		{ id: 'stealth', name: 'Скрытность', icon: '👤', color: 'accent-secondary' },
		{ id: 'social', name: 'Социальные', icon: '💬', color: 'success' },
		{ id: 'absurd', name: 'Абсурдные', icon: '🎭', color: 'warning' }
	];
	
	let selectedCategory = 'all';
	
	$: filteredSkills = selectedCategory === 'all' 
		? data.skills 
		: data.skills.filter((s: any) => s.category === selectedCategory);
</script>

<svelte:head>
	<title>Умения | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center" class="space-y-4">
		<div class="panel">
			<h1 class="text-2xl font-bold text-center mb-6 text-text-primary">📚 Умения героя</h1>
			
			<!-- Фильтры по категориям -->
			<div class="flex flex-wrap gap-2 mb-6 justify-center">
				<button
					class="btn text-sm py-2 px-4"
					class:btn-interactive={selectedCategory === 'all'}
					on:click={() => selectedCategory = 'all'}
				>
					Все ({data.skills.length})
				</button>
				{#each categories as cat}
					<button
						class="btn text-sm py-2 px-4"
						class:btn-interactive={selectedCategory === cat.id}
						on:click={() => selectedCategory = cat.id}
					>
						{cat.icon} {cat.name}
					</button>
				{/each}
			</div>
			
			<!-- Список умений -->
			{#if filteredSkills.length === 0}
				<div class="text-center text-text-muted py-12">
					<div class="text-5xl mb-4">📚</div>
					<p class="text-base">У героя пока нет умений</p>
					<p class="text-sm mt-2">Умения приобретаются случайно во время приключений!</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each filteredSkills as skill}
						<div class="p-4 bg-bg-primary border border-border-light rounded hover:border-border-medium transition-all">
							<div class="flex items-start gap-3 mb-2">
								<span class="text-3xl">{skill.icon}</span>
								<div class="flex-1">
									<h3 class="text-base font-semibold text-text-primary">{skill.name}</h3>
									<p class="text-xs text-text-muted capitalize">{skill.category}</p>
								</div>
								{#if skill.level > 1}
									<div class="bg-accent-primary text-bg-primary px-2 py-1 rounded text-xs font-semibold">
										Ур. {skill.level}
									</div>
								{/if}
							</div>
							
							<p class="text-sm text-text-secondary leading-relaxed">{skill.description}</p>
							
							<div class="mt-3 pt-3 border-t border-border-light">
								<p class="text-xs text-text-muted">
									Получено: {new Date(skill.acquiredAt).toLocaleDateString('ru-RU')}
								</p>
							</div>
						</div>
					{/each}
				</div>
			{/if}
			
			<!-- Информация -->
			<div class="mt-6 p-4 bg-bg-tertiary rounded border-l-4 border-info">
				<h4 class="text-sm font-semibold mb-2 text-text-primary">ℹ️ Об умениях</h4>
				<p class="text-xs text-text-secondary leading-relaxed">
					Герой случайно приобретает новые умения во время приключений. Некоторые умения можно улучшить, 
					используя их чаще. Абсурдные умения не всегда полезны, но всегда забавны!
				</p>
			</div>
		</div>
	</div>
</GameLayout>

