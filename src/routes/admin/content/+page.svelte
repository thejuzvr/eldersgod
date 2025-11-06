<script lang="ts">
	import { onMount } from 'svelte';
	import ContentTable from '$lib/components/admin/ContentTable.svelte';
	import ContentForm from '$lib/components/admin/ContentForm.svelte';
	import ContentStats from '$lib/components/admin/ContentStats.svelte';
	import type { GameContent } from '$lib/server/db/schema';
	
	// Состояние
	let content: GameContent[] = [];
	let loading = true;
	let error = '';
	let selectedContent: GameContent | null = null;
	let showForm = false;
	let currentFilter = 'all';
	
	// Фильтры
	const filters = [
		{ key: 'all', label: 'Весь контент', icon: '📚' },
		{ key: 'title', label: 'Титулы', icon: '👑' },
		{ key: 'thought', label: 'Мысли', icon: '💭' },
		{ key: 'item', label: 'Предметы', icon: '⚔️' },
		{ key: 'creature', label: 'Существа', icon: '🐉' },
		{ key: 'location', label: 'Локации', icon: '🌍' },
		{ key: 'action', label: 'Действия', icon: '🎭' }
	];
	
	// Загрузка данных
	async function loadContent() {
		loading = true;
		error = '';
		
		try {
			// Используем API вместо прямого импорта
			const params = new URLSearchParams({
				limit: '100',
				sortBy: 'updatedAt',
				sortOrder: 'desc',
				offset: '0'
			});
			
			if (currentFilter !== 'all') {
				params.append('type', currentFilter);
			}
			
			const response = await fetch(`/api/content?${params}`);
			const result = await response.json();
			
			if (result.success) {
				content = result.data.items;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки данных';
		} finally {
			loading = false;
		}
	}
	
	// Обработчики событий
	function handleEdit(contentItem: GameContent) {
		selectedContent = contentItem;
		showForm = true;
	}
	
	function handleDelete(contentItem: GameContent) {
		if (confirm(`Удалить "${contentItem.name || contentItem.text}"?`)) {
			handleDeleteContent(contentItem.id);
		}
	}
	
	async function handleDeleteContent(id: number) {
		try {
			const response = await fetch(`/api/content/${id}`, {
				method: 'DELETE'
			});
			
			const result = await response.json();
			
			if (result.success) {
				content = content.filter(c => c.id !== id);
			} else {
				alert('Ошибка при удалении: ' + result.error);
			}
		} catch (err) {
			alert('Ошибка при удалении: ' + (err instanceof Error ? err.message : 'Unknown error'));
		}
	}
	
	function handleCreate() {
		selectedContent = null;
		showForm = true;
	}
	
	function handleFormClose() {
		showForm = false;
		selectedContent = null;
		loadContent(); // Перезагружаем данные
	}
	
	function changeFilter(filter: string) {
		currentFilter = filter;
		loadContent();
	}
	
	// Инициализация
	onMount(() => {
		loadContent();
	});
</script>

<svelte:head>
	<title>Админ-панель: Управление контентом</title>
</svelte:head>

<div class="admin-content p-6 bg-bg-secondary min-h-screen">
	<!-- Заголовок -->
	<div class="mb-8">
		<h1 class="text-3xl font-bold text-text-primary mb-2">
			📊 Управление контентом
		</h1>
		<p class="text-text-secondary">
			Система управления игровым контентом: титулы, мысли, предметы, локации и многое другое
		</p>
	</div>
	
	<!-- Статистика -->
	<ContentStats />
	
	<!-- Фильтры -->
	<div class="mb-6">
		<div class="flex flex-wrap gap-2">
			{#each filters as filter}
				<button
					class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {
						currentFilter === filter.key 
						? 'bg-accent-primary text-white' 
						: 'bg-white text-text-primary hover:bg-gray-50 border border-gray-200'
					}"
					on:click={() => changeFilter(filter.key)}
				>
					{filter.icon} {filter.label}
				</button>
			{/each}
		</div>
	</div>
	
	<!-- Панель действий -->
	<div class="mb-6 flex justify-between items-center">
		<div class="text-text-secondary">
			Всего элементов: {content.length}
		</div>
		
		<button
			class="btn btn-interactive px-6 py-3"
			on:click={handleCreate}
		>
			➕ Создать контент
		</button>
	</div>
	
	<!-- Основной контент -->
	{#if loading}
		<div class="flex items-center justify-center py-12">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary"></div>
			<span class="ml-3 text-text-secondary">Загрузка контента...</span>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
			❌ {error}
		</div>
	{:else if content.length === 0}
		<div class="text-center py-12 text-text-secondary">
			📭 Контент не найден
		</div>
	{:else}
		<ContentTable
			{content}
			on:edit={e => handleEdit(e.detail)}
			on:delete={e => handleDelete(e.detail)}
		/>
	{/if}
	
	<!-- Форма создания/редактирования -->
	{#if showForm}
		<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
			<div class="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
				<div class="p-6">
					<div class="flex justify-between items-center mb-6">
						<h2 class="text-xl font-semibold text-text-primary">
							{selectedContent ? 'Редактировать контент' : 'Создать новый контент'}
						</h2>
						<button
							class="text-gray-400 hover:text-gray-600 text-xl"
							on:click={handleFormClose}
						>
							✕
						</button>
					</div>
					
					<ContentForm
						content={selectedContent}
						on:close={handleFormClose}
						on:saved={handleFormClose}
					/>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.admin-content {
		background: var(--bg-secondary);
	}
	
	.btn-interactive {
		background: var(--accent-primary);
		color: var(--bg-primary);
		border-color: var(--accent-primary);
	}
	
	.btn-interactive:hover {
		background: var(--accent-secondary);
		border-color: var(--accent-secondary);
	}
</style>