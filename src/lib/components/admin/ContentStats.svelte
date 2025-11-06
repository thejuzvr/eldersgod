<script lang="ts">
	import { onMount } from 'svelte';
	import { ContentService } from '$lib/services/contentService';
	
	// Статистика
	let stats = {
		total: 0,
		active: 0,
		inactive: 0,
		byType: {} as Record<string, number>,
		byRarity: {} as Record<string, number>,
		avgWeight: 0,
		recentItems: 0
	};
	
	let loading = true;
	let error = '';
	
	// Загрузка статистики
	async function loadStats() {
		loading = true;
		error = '';
		
		try {
			// Загружаем всю статистику контента
			const result = await ContentService.getContentStats();
			
			// Проверяем что результат валидный
			if (result && typeof result === 'object' && 'total' in result) {
				stats = result as any;
			} else {
				await loadStatsFromSearch();
			}
			
		} catch (err) {
			console.log('getContentStats method not available, loading via search');
			await loadStatsFromSearch();
		} finally {
			loading = false;
		}
	}
	
	// Загрузка статистики через поиск (fallback)
	async function loadStatsFromSearch() {
		try {
			const allContent = await ContentService.searchContent({
				limit: 1000,
				sortBy: 'createdAt',
				sortOrder: 'desc',
				offset: 0,
				includeAnalytics: false,
				includeTranslations: false
			});
			
			const items = allContent.items;
			
			stats = {
				total: items.length,
				active: items.filter((item: any) => item.isActive).length,
				inactive: items.filter((item: any) => !item.isActive).length,
				byType: getCountsByField(items, 'type'),
				byRarity: getCountsByField(items, 'rarity'),
				avgWeight: Math.round(items.reduce((sum: number, item: any) => sum + (item.weight || 0), 0) / items.length),
				recentItems: items.filter((item: any) => {
					const updateTime = new Date(item.updatedAt || item.createdAt || Date.now());
					return (Date.now() - updateTime.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 дней
				}).length
			};
			
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка загрузки статистики';
		}
	}
	
	// Подсчет по полю
	function getCountsByField(items: any[], field: string) {
		return items.reduce((counts, item) => {
			const value = item[field] || 'без категории';
			counts[value] = (counts[value] || 0) + 1;
			return counts;
		}, {} as Record<string, number>);
	}
	
	// Форматирование процентов
	function formatPercent(value: number, total: number) {
		if (total === 0) return '0%';
		return Math.round((value / total) * 100) + '%';
	}
	
	// Получить цвет для типа
	function getTypeColor(type: string) {
		const colors = {
			'title': 'bg-purple-100 text-purple-800',
			'thought': 'bg-blue-100 text-blue-800',
			'item': 'bg-green-100 text-green-800',
			'creature': 'bg-orange-100 text-orange-800',
			'location': 'bg-teal-100 text-teal-800',
			'action': 'bg-pink-100 text-pink-800',
			'skill': 'bg-indigo-100 text-indigo-800'
		};
		return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
	}
	
	// Получить цвет для редкости
	function getRarityColor(rarity: string) {
		const colors = {
			'common': 'bg-gray-100 text-gray-800',
			'uncommon': 'bg-green-100 text-green-800',
			'rare': 'bg-blue-100 text-blue-800',
			'epic': 'bg-purple-100 text-purple-800',
			'legendary': 'bg-yellow-100 text-yellow-800',
			'absurd': 'bg-pink-100 text-pink-800',
			'без категории': 'bg-gray-50 text-gray-500'
		};
		return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
	}
	
	onMount(() => {
		loadStats();
	});
</script>

<div class="content-stats mb-8">
	{#if loading}
		<div class="flex items-center justify-center py-8">
			<div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
			<span class="ml-2 text-gray-600">Загрузка статистики...</span>
		</div>
	{:else if error}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
			❌ {error}
		</div>
	{:else}
		<!-- Основные карточки -->
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
							📊
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Всего контента</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.total}</p>
					</div>
				</div>
			</div>
			
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
							✅
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Активный</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.active}</p>
					</div>
				</div>
			</div>
			
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
							❌
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Неактивный</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.inactive}</p>
					</div>
				</div>
			</div>
			
			<div class="bg-white rounded-lg shadow p-6">
				<div class="flex items-center">
					<div class="flex-shrink-0">
						<div class="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
							⚖️
						</div>
					</div>
					<div class="ml-4">
						<p class="text-sm font-medium text-gray-600">Средний вес</p>
						<p class="text-2xl font-semibold text-gray-900">{stats.avgWeight}</p>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Графики -->
		<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
			<!-- По типам контента -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">📂 По типам контента</h3>
				<div class="space-y-3">
					{#each Object.entries(stats.byType) as [type, count]}
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getTypeColor(type)}">
									{type}
								</span>
								<span class="ml-2 text-sm text-gray-600">{count} шт.</span>
							</div>
							<div class="flex items-center">
								<div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
									<div 
										class="bg-blue-600 h-2 rounded-full transition-all duration-300"
										style="width: {formatPercent(count, stats.total)}"
									></div>
								</div>
								<span class="text-sm text-gray-500 w-10 text-right">
									{formatPercent(count, stats.total)}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
			
			<!-- По редкости -->
			<div class="bg-white rounded-lg shadow p-6">
				<h3 class="text-lg font-semibold text-gray-900 mb-4">⭐ По редкости</h3>
				<div class="space-y-3">
					{#each Object.entries(stats.byRarity) as [rarity, count]}
						<div class="flex items-center justify-between">
							<div class="flex items-center">
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {getRarityColor(rarity)}">
									{rarity}
								</span>
								<span class="ml-2 text-sm text-gray-600">{count} шт.</span>
							</div>
							<div class="flex items-center">
								<div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
									<div 
										class="bg-yellow-600 h-2 rounded-full transition-all duration-300"
										style="width: {formatPercent(count, stats.total)}"
									></div>
								</div>
								<span class="text-sm text-gray-500 w-10 text-right">
									{formatPercent(count, stats.total)}
								</span>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
		
		<!-- Дополнительная информация -->
		<div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
			<div class="bg-white rounded-lg shadow p-4">
				<div class="text-center">
					<div class="text-2xl mb-2">🆕</div>
					<div class="text-2xl font-semibold text-gray-900">{stats.recentItems}</div>
					<div class="text-sm text-gray-600">Новых за 7 дней</div>
				</div>
			</div>
			
			<div class="bg-white rounded-lg shadow p-4">
				<div class="text-center">
					<div class="text-2xl mb-2">📈</div>
					<div class="text-2xl font-semibold text-gray-900">
						{stats.total > 0 ? Math.round((stats.active / stats.total) * 100) : 0}%
					</div>
					<div class="text-sm text-gray-600">Активность</div>
				</div>
			</div>
			
			<div class="bg-white rounded-lg shadow p-4">
				<div class="text-center">
					<div class="text-2xl mb-2">🎯</div>
					<div class="text-2xl font-semibold text-gray-900">
						{Object.keys(stats.byType).length}
					</div>
					<div class="text-sm text-gray-600">Типов контента</div>
				</div>
			</div>
		</div>
	{/if}
</div>