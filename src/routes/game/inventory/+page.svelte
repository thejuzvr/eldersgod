<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	
	export let data;
	
	const rarityColors: Record<string, string> = {
		common: 'border-border-medium',
		uncommon: 'border-success',
		rare: 'border-info',
		epic: 'border-warning',
		legendary: 'border-danger',
		absurd: 'border-accent-primary'
	};
	
	const rarityLabels: Record<string, string> = {
		common: 'Обычный',
		uncommon: 'Необычный',
		rare: 'Редкий',
		epic: 'Эпический',
		legendary: 'Легендарный',
		absurd: 'Абсурдный'
	};
	
	let selectedFilter = 'all';
	let showEquipped = true;
	
	$: equippedItems = data.inventory.filter((i: any) => i.equipped);
	$: unequippedItems = data.inventory.filter((i: any) => !i.equipped);
	
	$: filteredItems = (() => {
		let items = selectedFilter === 'all' ? data.inventory : data.inventory.filter((i: any) => i.item.type === selectedFilter);
		return showEquipped ? items : items.filter((i: any) => !i.equipped);
	})();
	
	$: equippedCount = data.inventory.filter((i: any) => i.equipped).length;
	$: totalWeight = data.inventory.length;
	$: maxWeight = 26;
	
	const equipmentSlots = [
		{ type: 'weapon', name: 'Оружие', icon: '⚔️' },
		{ type: 'armor', name: 'Броня', icon: '🛡️' },
		{ type: 'helmet', name: 'Шлем', icon: '⛑️' },
		{ type: 'boots', name: 'Сапоги', icon: '👢' },
		{ type: 'artifact', name: 'Артефакт', icon: '💎' }
	];
	
	function getEquippedInSlot(slotType: string) {
		return equippedItems.find((i: any) => i.item.type === slotType);
	}
</script>

<svelte:head>
	<title>Инвентарь | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center" class="space-y-4">
		<!-- Снаряжение (что надето) -->
		<div class="panel">
			<h2 class="text-xl font-semibold text-text-primary mb-4">⚔️ Текущее снаряжение</h2>
			
			<div class="grid grid-cols-2 md:grid-cols-5 gap-3">
				{#each equipmentSlots as slot}
					{@const equipped = getEquippedInSlot(slot.type)}
					<div class="p-3 bg-bg-secondary border border-border-light rounded text-center">
						<div class="text-2xl mb-2">{slot.icon}</div>
						<p class="text-xs text-text-muted mb-2">{slot.name}</p>
						{#if equipped}
							<div class="text-center">
								<p class="text-xl mb-1">{equipped.item.icon}</p>
								<p class="text-xs font-medium text-text-primary">{equipped.item.name}</p>
								{#if equipped.item.stats && Object.keys(equipped.item.stats).length > 0}
									<div class="mt-1 flex flex-wrap gap-1 justify-center">
										{#each Object.entries(equipped.item.stats) as [stat, value]}
											<span class="text-xs text-success">+{value}</span>
										{/each}
									</div>
								{/if}
							</div>
						{:else}
							<p class="text-xs text-text-muted italic">Пусто</p>
						{/if}
					</div>
				{/each}
			</div>
			
			<div class="mt-4 p-3 bg-bg-tertiary rounded">
				<p class="text-xs text-text-secondary text-center">
					💡 Герой автоматически экипирует лучшие предметы (как в Godville)
				</p>
			</div>
		</div>
		
		<!-- Инвентарь -->
		<div class="panel">
			<div class="flex items-center justify-between mb-6">
				<h1 class="text-2xl font-bold text-text-primary">🎒 Все предметы</h1>
				<div class="text-sm text-text-secondary">
					<span class="font-semibold text-text-primary">{totalWeight}</span> / {maxWeight} предметов
				</div>
			</div>
			
			<!-- Фильтры -->
			<div class="flex flex-wrap gap-2 mb-4">
				<button
					class="btn text-sm py-2 px-4"
					class:btn-interactive={selectedFilter === 'all'}
					on:click={() => selectedFilter = 'all'}
				>
					Всё ({data.inventory.length})
				</button>
				<button
					class="btn text-sm py-2 px-4"
					class:btn-interactive={selectedFilter === 'weapon'}
					on:click={() => selectedFilter = 'weapon'}
				>
					⚔️ Оружие
				</button>
				<button
					class="btn text-sm py-2 px-4"
					class:btn-interactive={selectedFilter === 'armor'}
					on:click={() => selectedFilter = 'armor'}
				>
					🛡️ Броня
				</button>
				<button
					class="btn text-sm py-2 px-4"
					class:btn-interactive={selectedFilter === 'artifact'}
					on:click={() => selectedFilter = 'artifact'}
				>
					💎 Артефакты
				</button>
				<button
					class="btn text-sm py-2 px-4"
					class:btn-interactive={selectedFilter === 'consumable'}
					on:click={() => selectedFilter = 'consumable'}
				>
					🧪 Расходники
				</button>
			</div>
			
			<!-- Переключатель показа экипированных -->
			<div class="mb-4 flex items-center justify-center gap-2">
				<label class="flex items-center gap-2 cursor-pointer">
					<input 
						type="checkbox" 
						bind:checked={showEquipped}
						class="w-4 h-4"
					/>
					<span class="text-sm text-text-secondary">Показать экипированные предметы</span>
				</label>
			</div>
			
			<!-- Список предметов -->
			{#if filteredItems.length === 0}
				<div class="text-center text-text-muted py-12">
					<div class="text-5xl mb-4">📦</div>
					<p class="text-base">Инвентарь пуст</p>
					<p class="text-sm mt-2">Находите предметы во время приключений!</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each filteredItems as invItem}
						<div 
							class="p-4 bg-bg-primary border-2 rounded hover:shadow-md transition-all {rarityColors[invItem.item.rarity] || 'border-border-light'}"
							class:bg-bg-tertiary={invItem.equipped}
						>
							<div class="flex items-start justify-between mb-2">
								<div class="flex items-start gap-2">
									<span class="text-3xl">{invItem.item.icon}</span>
									<div class="flex-1">
										<div class="flex items-center gap-2 mb-1">
											<h3 class="text-sm font-semibold text-text-primary">{invItem.item.name}</h3>
											{#if invItem.equipped}
												<span class="text-xs bg-success text-bg-primary px-2 py-0.5 rounded font-medium">
													Надето
												</span>
											{/if}
										</div>
										<p class="text-xs text-text-muted capitalize">
											{rarityLabels[invItem.item.rarity] || invItem.item.rarity} • {invItem.item.type}
										</p>
									</div>
								</div>
							</div>
							
							<p class="text-xs text-text-secondary mb-3 leading-relaxed">
								{invItem.item.description}
							</p>
							
							<!-- Характеристики -->
							{#if invItem.item.stats && Object.keys(invItem.item.stats).length > 0}
								<div class="p-2 bg-bg-secondary rounded">
									<p class="text-xs font-medium text-text-primary mb-1">Бонусы:</p>
									<div class="flex flex-wrap gap-2">
										{#each Object.entries(invItem.item.stats) as [stat, value]}
											<span class="text-xs text-success font-medium">
												+{value} {stat === 'strength' ? '💪 Сила' : stat === 'intelligence' ? '🧠 Интеллект' : stat === 'luck' ? '🍀 Удача' : stat === 'health' ? '❤️ HP' : stat}
											</span>
										{/each}
									</div>
								</div>
							{/if}
							
							<p class="text-xs text-text-muted mt-2 text-center">
								Получено: {new Date(invItem.acquiredAt).toLocaleDateString('ru-RU')}
							</p>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</GameLayout>

