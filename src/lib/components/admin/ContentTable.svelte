<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { GameContent } from '$lib/server/db/schema';
	
	export let content: GameContent[] = [];
	
	const dispatch = createEventDispatcher();
	
	// Функции для форматирования
	function formatDate(date: Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleString('ru-RU');
	}
	
	function formatRarity(rarity: string | null) {
		const colors = {
			'common': 'bg-gray-100 text-gray-800',
			'uncommon': 'bg-green-100 text-green-800',
			'rare': 'bg-blue-100 text-blue-800',
			'epic': 'bg-purple-100 text-purple-800',
			'legendary': 'bg-yellow-100 text-yellow-800',
			'absurd': 'bg-pink-100 text-pink-800'
		};
		
		return colors[rarity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
	}
	
	function getTypeIcon(type: string) {
		const icons = {
			'title': '👑',
			'thought': '💭',
			'item': '⚔️',
			'creature': '🐉',
			'location': '🌍',
			'action': '🎭',
			'skill': '📚'
		};
		
		return icons[type as keyof typeof icons] || '📄';
	}
	
	function handleEdit(contentItem: GameContent) {
		dispatch('edit', contentItem);
	}
	
	function handleDelete(contentItem: GameContent) {
		dispatch('delete', contentItem);
	}
</script>

<div class="bg-white rounded-lg shadow overflow-hidden">
	<div class="overflow-x-auto">
		<table class="min-w-full divide-y divide-gray-200">
			<thead class="bg-gray-50">
				<tr>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						Контент
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						Тип
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						Редкость
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						Вес
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						Статус
					</th>
					<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
						Обновлён
					</th>
					<th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
						Действия
					</th>
				</tr>
			</thead>
			<tbody class="bg-white divide-y divide-gray-200">
				{#each content as contentItem}
					<tr class="hover:bg-gray-50">
						<!-- Контент -->
						<td class="px-6 py-4">
							<div class="flex items-start">
								<span class="text-2xl mr-3 flex-shrink-0">
									{getTypeIcon(contentItem.type)}
								</span>
								<div class="min-w-0 flex-1">
									<div class="text-sm font-medium text-gray-900 mb-1">
										{contentItem.name || contentItem.text || 'Без названия'}
									</div>
									{#if contentItem.name && contentItem.text}
										<div class="text-sm text-gray-500 line-clamp-2">
											{contentItem.text}
										</div>
									{/if}
									<div class="mt-1 flex flex-wrap gap-1">
										{#if contentItem.category}
											<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
												{contentItem.category}
											</span>
										{/if}
										{#if contentItem.tags && contentItem.tags.length > 0}
											{#each contentItem.tags.slice(0, 3) as tag}
												<span class="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
													{tag}
												</span>
											{/each}
											{#if contentItem.tags.length > 3}
												<span class="text-xs text-gray-400">
													+{contentItem.tags.length - 3} еще
												</span>
											{/if}
										{/if}
									</div>
								</div>
							</div>
						</td>
						
						<!-- Тип -->
						<td class="px-6 py-4 whitespace-nowrap">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
								{contentItem.type}
							</span>
						</td>
						
						<!-- Редкость -->
						<td class="px-6 py-4 whitespace-nowrap">
							{#if contentItem.rarity}
								<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {formatRarity(contentItem.rarity)}">
									{contentItem.rarity}
								</span>
							{:else}
								<span class="text-gray-400 text-sm">-</span>
							{/if}
						</td>
						
						<!-- Вес -->
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
							{contentItem.weight || 0}
						</td>
						
						<!-- Статус -->
						<td class="px-6 py-4 whitespace-nowrap">
							<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {contentItem.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
								{contentItem.isActive ? 'Активен' : 'Неактивен'}
							</span>
						</td>
						
						<!-- Дата обновления -->
						<td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
							{formatDate(contentItem.updatedAt || contentItem.createdAt)}
						</td>
						
						<!-- Действия -->
						<td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
							<div class="flex justify-end gap-2">
								<button
									class="text-blue-600 hover:text-blue-900 text-sm font-medium"
									on:click={() => handleEdit(contentItem)}
								>
									Редактировать
								</button>
								<button
									class="text-red-600 hover:text-red-900 text-sm font-medium"
									on:click={() => handleDelete(contentItem)}
								>
									Удалить
								</button>
							</div>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	.line-clamp-2 {
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
</style>