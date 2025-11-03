<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	import ProgressBar from '$lib/components/ProgressBar.svelte';
	
	export let data;
	
	const { hero, inventory, skills } = data;
	
	$: equippedItems = inventory.filter((i: any) => i.equipped);
	$: expProgress = hero.experience % getExpForNextLevel(hero.level);
	$: expNeeded = getExpForNextLevel(hero.level);
	
	function getExpForNextLevel(level: number): number {
		return Math.floor(100 * Math.pow(1.5, level));
	}
	
	const rarityLabels: Record<string, string> = {
		common: 'Обычный',
		uncommon: 'Необычный',
		rare: 'Редкий',
		epic: 'Эпический',
		legendary: 'Легендарный',
		absurd: 'Абсурдный'
	};
	
	const equipmentSlots = [
		{ id: 'weapon', name: 'Оружие', icon: '⚔️' },
		{ id: 'armor', name: 'Броня', icon: '🛡️' },
		{ id: 'helmet', name: 'Шлем', icon: '⛑️' },
		{ id: 'boots', name: 'Сапоги', icon: '👢' },
		{ id: 'artifact', name: 'Артефакт', icon: '💎' }
	];
	
	function getEquippedInSlot(slotType: string) {
		return equippedItems.find((i: any) => i.item.type === slotType);
	}
</script>

<svelte:head>
	<title>Героиня | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center">
		<div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
			<!-- Левая колонка - Основная информация -->
			<div class="space-y-4">
				<div class="panel">
					<div class="text-center mb-4">
						<div class="text-6xl mb-3">⚔️</div>
						<h1 class="text-2xl font-bold text-text-primary mb-2">{hero.name}</h1>
						<p class="text-sm text-text-secondary">{hero.title}</p>
						<p class="text-xs text-text-muted mt-1">{hero.race}</p>
						{#if hero.currentLocation}
							<p class="text-xs text-info mt-2">📍 {hero.currentLocation}</p>
						{/if}
					</div>
					
					<!-- Уровень -->
					<div class="mb-4 text-center">
						<div class="inline-block bg-accent-primary text-bg-primary px-6 py-2 rounded font-bold text-lg">
							Уровень {hero.level}
						</div>
					</div>
					
					<!-- Опыт -->
					<div class="mb-4">
						<ProgressBar 
							current={expProgress}
							max={expNeeded}
							label="⭐ Опыт до следующего уровня"
							color="var(--accent-primary)"
						/>
					</div>
					
					<!-- HP -->
					<div class="mb-4">
						<ProgressBar 
							current={hero.currentHealth}
							max={hero.maxHealth}
							label="❤️ Здоровье"
							color="var(--danger)"
						/>
					</div>
					
					<!-- Характеристики -->
					<div class="space-y-2">
						<h3 class="text-sm font-semibold text-text-primary mb-3">📊 Характеристики</h3>
						<div class="grid grid-cols-3 gap-2">
							<div class="text-center p-3 bg-bg-secondary rounded">
								<div class="text-2xl mb-1">💪</div>
								<div class="text-xs text-text-muted">Сила</div>
								<div class="text-lg font-bold text-text-primary">{hero.strength}</div>
							</div>
							<div class="text-center p-3 bg-bg-secondary rounded">
								<div class="text-2xl mb-1">🧠</div>
								<div class="text-xs text-text-muted">Интеллект</div>
								<div class="text-lg font-bold text-text-primary">{hero.intelligence}</div>
							</div>
							<div class="text-center p-3 bg-bg-secondary rounded">
								<div class="text-2xl mb-1">🍀</div>
								<div class="text-xs text-text-muted">Удача</div>
								<div class="text-lg font-bold text-text-primary">{hero.luck}</div>
							</div>
						</div>
					</div>
					
					<!-- Валюты -->
					<div class="mt-4 pt-4 border-t border-border-light space-y-2">
						<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
							<span class="text-sm text-text-secondary">💰 Золото</span>
							<span class="text-base font-bold text-text-primary">{hero.gold}</span>
						</div>
						<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
							<span class="text-sm text-text-secondary">🔥 Души драконов</span>
							<span class="text-base font-bold text-warning">{hero.dragonSouls}</span>
						</div>
					</div>
				</div>
			</div>
			
			<!-- Центральная колонка - Снаряжение -->
			<div class="space-y-4">
				<div class="panel">
					<h2 class="text-xl font-semibold text-text-primary mb-4 text-center">⚔️ Снаряжение</h2>
					
					<div class="space-y-3">
						{#each equipmentSlots as slot}
							{@const equipped = getEquippedInSlot(slot.id)}
							<div class="p-3 bg-bg-secondary border border-border-light rounded">
								<div class="flex items-center gap-3">
									<span class="text-2xl">{slot.icon}</span>
									<div class="flex-1">
										<p class="text-xs text-text-muted mb-1">{slot.name}</p>
										{#if equipped}
											<p class="text-sm font-semibold text-text-primary">{equipped.item.name}</p>
											<p class="text-xs text-success capitalize mt-0.5">{rarityLabels[equipped.item.rarity] || equipped.item.rarity}</p>
										{:else}
											<p class="text-xs text-text-muted italic">Пусто</p>
										{/if}
									</div>
								</div>
								
								{#if equipped && equipped.item.stats}
									<div class="mt-2 flex flex-wrap gap-1">
										{#each Object.entries(equipped.item.stats) as [stat, value]}
											<span class="text-xs text-success bg-success bg-opacity-10 px-2 py-0.5 rounded font-medium">
												+{value} {stat === 'strength' ? '💪' : stat === 'intelligence' ? '🧠' : stat === 'luck' ? '🍀' : stat}
											</span>
										{/each}
									</div>
								{/if}
							</div>
						{/each}
					</div>
					
					<div class="mt-4 p-3 bg-bg-tertiary rounded">
						<p class="text-xs text-text-secondary text-center">
							💡 Герой сам решает, что носить. Лучшие предметы экипируются автоматически!
						</p>
					</div>
					
					<!-- Суммарные бонусы -->
					{#if equippedItems.length > 0}
						{@const totalStr = equippedItems.reduce((sum: number, i: any) => sum + (i.item.stats?.strength || 0), 0)}
						{@const totalInt = equippedItems.reduce((sum: number, i: any) => sum + (i.item.stats?.intelligence || 0), 0)}
						{@const totalLuck = equippedItems.reduce((sum: number, i: any) => sum + (i.item.stats?.luck || 0), 0)}
						
						<div class="mt-4 pt-4 border-t border-border-light">
							<h3 class="text-sm font-semibold text-text-primary mb-2">📈 Бонусы от снаряжения</h3>
							<div class="grid grid-cols-3 gap-2">
								<div class="text-center p-2 bg-bg-tertiary rounded">
									<p class="text-xs text-text-muted">💪</p>
									<p class="text-sm font-bold text-success">+{totalStr}</p>
								</div>
								<div class="text-center p-2 bg-bg-tertiary rounded">
									<p class="text-xs text-text-muted">🧠</p>
									<p class="text-sm font-bold text-success">+{totalInt}</p>
								</div>
								<div class="text-center p-2 bg-bg-tertiary rounded">
									<p class="text-xs text-text-muted">🍀</p>
									<p class="text-sm font-bold text-success">+{totalLuck}</p>
								</div>
							</div>
						</div>
					{/if}
				</div>
			</div>
			
			<!-- Правая колонка - Умения -->
			<div class="space-y-4">
				<div class="panel">
					<h2 class="text-xl font-semibold text-text-primary mb-4 text-center">📚 Умения</h2>
					
					{#if skills.length === 0}
						<div class="text-center text-text-muted py-8">
							<div class="text-4xl mb-2">📖</div>
							<p class="text-sm">Нет умений</p>
						</div>
					{:else}
						<div class="space-y-2 max-h-96 overflow-y-auto">
							{#each skills.slice(0, 10) as skill}
								<div class="p-3 bg-bg-secondary rounded border border-border-light">
									<div class="flex items-start gap-2">
										<span class="text-xl">{skill.icon}</span>
										<div class="flex-1">
											<p class="text-sm font-semibold text-text-primary">{skill.name}</p>
											<p class="text-xs text-text-secondary">{skill.description}</p>
											{#if skill.level > 1}
												<p class="text-xs text-accent-primary mt-1">Уровень {skill.level}</p>
											{/if}
										</div>
									</div>
								</div>
							{/each}
						</div>
						
						{#if skills.length > 10}
							<div class="mt-3 text-center">
								<a href="/game/skills" class="text-sm text-accent-primary hover:text-accent-secondary underline">
									Показать все умения ({skills.length})
								</a>
							</div>
						{/if}
					{/if}
				</div>
				
				<!-- Быстрая статистика -->
				<div class="panel">
					<h3 class="text-sm font-semibold text-text-primary mb-3 text-center">📊 Статистика</h3>
					<div class="space-y-2">
						<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
							<span class="text-xs text-text-muted">Всего предметов</span>
							<span class="text-sm font-semibold text-text-primary">{inventory.length}</span>
						</div>
						<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
							<span class="text-xs text-text-muted">Экипировано</span>
							<span class="text-sm font-semibold text-text-primary">{equippedItems.length}</span>
						</div>
						<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
							<span class="text-xs text-text-muted">Умений изучено</span>
							<span class="text-sm font-semibold text-text-primary">{skills.length}</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</GameLayout>

