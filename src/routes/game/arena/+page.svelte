<script lang="ts">
	import { goto } from '$app/navigation';
	import GameLayout from '$lib/components/GameLayout.svelte';
	import HeroPanel from '$lib/components/HeroPanel.svelte';

	export let data;
	
	let filterType: 'all' | 'wins' | 'losses' = 'all';
	let expandedBattle: number | null = null;

	function formatDate(timestamp: string | Date) {
		const date = new Date(timestamp);
		return date.toLocaleString('ru-RU', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
	
	function formatDateShort(timestamp: string | Date) {
		const date = new Date(timestamp);
		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffHours = Math.floor(diffMs / 3600000);
		const diffDays = Math.floor(diffMs / 86400000);
		
		if (diffHours < 1) return 'только что';
		if (diffHours < 24) return `${diffHours}ч назад`;
		if (diffDays < 7) return `${diffDays}д назад`;
		return date.toLocaleDateString('ru-RU');
	}

	function getBattleResultClass(battle: any) {
		if (battle.winnerId === data.hero.id) {
			return 'text-success';
		}
		return 'text-danger';
	}

	function getBattleResultIcon(battle: any) {
		if (battle.winnerId === data.hero.id) {
			return '🏆';
		}
		return '💀';
	}

	function getBattleResultText(battle: any) {
		if (battle.winnerId === data.hero.id) {
			return 'Победа';
		}
		return 'Поражение';
	}
	
	function toggleBattleDetails(battleId: number) {
		expandedBattle = expandedBattle === battleId ? null : battleId;
	}
	
	$: filteredBattles = data.battles.filter(battle => {
		if (filterType === 'all') return true;
		if (filterType === 'wins') return battle.winnerId === data.hero.id;
		if (filterType === 'losses') return battle.winnerId !== data.hero.id;
		return true;
	});
</script>

<svelte:head>
	<title>Арена | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout>
	<!-- Левая панель - Герой -->
	<div slot="left-panel" class="space-y-4">
		<HeroPanel hero={data.hero} />
		
		<!-- Кнопка возврата -->
		<button class="btn w-full" on:click={() => goto('/game')}>
			⬅️ Назад к игре
		</button>
	</div>
	
	<!-- Центр - История боёв -->
	<div slot="center" class="space-y-4">
		<div class="panel h-full flex flex-col">
			<div class="mb-4 text-center border-b border-border-light pb-3">
				<h2 class="text-2xl font-semibold text-text-primary">⚔️ История Боёв Арены</h2>
				<p class="text-xs text-text-muted mt-1">Твои славные сражения</p>
			</div>
			
			<!-- Фильтры -->
			{#if data.battles.length > 0}
				<div class="flex gap-2 mb-4">
					<button 
						class="btn flex-1 text-sm py-2"
						class:btn-interactive={filterType === 'all'}
						on:click={() => filterType = 'all'}
					>
						Все ({data.battles.length})
					</button>
					<button 
						class="btn flex-1 text-sm py-2"
						class:btn-interactive={filterType === 'wins'}
						on:click={() => filterType = 'wins'}
					>
						Победы ({data.battles.filter(b => b.winnerId === data.hero.id).length})
					</button>
					<button 
						class="btn flex-1 text-sm py-2"
						class:btn-interactive={filterType === 'losses'}
						on:click={() => filterType = 'losses'}
					>
						Поражения ({data.battles.filter(b => b.winnerId !== data.hero.id).length})
					</button>
				</div>
			{/if}

			<div class="flex-1 overflow-y-auto pr-2 space-y-3">
				{#if filteredBattles.length === 0 && data.battles.length === 0}
					<div class="text-center text-text-muted mt-10">
						<div class="text-5xl mb-4">🏟️</div>
						<p class="text-base">У тебя пока нет боёв</p>
						<p class="text-sm mt-2">Присоединись к очереди арены, чтобы начать сражения!</p>
					</div>
				{:else if filteredBattles.length === 0}
					<div class="text-center text-text-muted mt-10">
						<p class="text-sm">Нет боёв в этой категории</p>
					</div>
				{:else}
					{#each filteredBattles as battle, index (battle.id || index)}
						<div class="p-3 bg-bg-primary border border-border-light rounded fade-in-up hover:border-border-medium transition-all">
							<div class="flex items-start justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="text-2xl">{getBattleResultIcon(battle)}</span>
									<div>
										<h3 class="text-base font-semibold {getBattleResultClass(battle)}">
											{getBattleResultText(battle)}
										</h3>
										<p class="text-xs text-text-muted">
											{formatDateShort(battle.createdAt)}
										</p>
									</div>
								</div>
								<button 
									class="text-xs text-accent-primary hover:text-accent-secondary"
									on:click={() => toggleBattleDetails(battle.id || index)}
								>
									{expandedBattle === (battle.id || index) ? '▲ Скрыть' : '▼ Детали'}
								</button>
							</div>

							<div class="grid grid-cols-2 gap-3">
								<!-- Игрок -->
								<div class="text-center p-2 bg-bg-secondary rounded">
									<p class="text-xs text-text-muted mb-1">Ты</p>
									<p class="text-sm font-semibold text-text-primary">{data.hero.name}</p>
									<p class="text-xs text-text-secondary">Ур. {data.hero.level}</p>
								</div>

								<!-- Противник -->
								<div class="text-center p-2 bg-bg-secondary rounded">
									<p class="text-xs text-text-muted mb-1">Противник</p>
									<p class="text-sm font-semibold text-text-primary">{battle.opponentName || 'Неизвестный'}</p>
									<p class="text-xs text-text-secondary">Ур. {battle.opponentLevel || '?'}</p>
								</div>
							</div>

							<!-- Награды -->
							{#if battle.rewards}
								<div class="flex flex-wrap gap-2 justify-center mt-3 pt-2 border-t border-border-light">
									{#if battle.rewards.exp}
										<div class="flex items-center gap-1 text-success text-xs px-2 py-1 bg-success bg-opacity-10 rounded">
											<span>✅</span>
											<span class="font-medium">+{battle.rewards.exp} опыта</span>
										</div>
									{/if}
									
									{#if battle.rewards.gold}
										<div class="flex items-center gap-1 text-xs px-2 py-1 rounded" 
											class:text-success={battle.rewards.gold > 0} 
											class:bg-success={battle.rewards.gold > 0}
											class:text-danger={battle.rewards.gold < 0}
											class:bg-danger={battle.rewards.gold < 0}
											class:bg-opacity-10={true}
										>
											<span>{battle.rewards.gold > 0 ? '✅' : '❌'}</span>
											<span class="font-medium">{battle.rewards.gold > 0 ? '+' : ''}{battle.rewards.gold} золота</span>
										</div>
									{/if}
								</div>
							{/if}
							
							<!-- Детали боя -->
							{#if expandedBattle === (battle.id || index)}
								<div class="mt-3 pt-3 border-t border-border-light">
									<h4 class="text-xs font-medium text-text-primary mb-2">Подробности боя:</h4>
									<div class="grid grid-cols-2 gap-2 text-xs">
										<div class="p-2 bg-bg-secondary rounded">
											<p class="text-text-muted">Полная дата:</p>
											<p class="text-text-primary font-medium">{formatDate(battle.createdAt)}</p>
										</div>
										<div class="p-2 bg-bg-secondary rounded">
											<p class="text-text-muted">ID боя:</p>
											<p class="text-text-primary font-medium">#{battle.id || index}</p>
										</div>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				{/if}
			</div>
		</div>
	</div>
	
	<!-- Правая панель - Статистика -->
	<div slot="right-panel" class="space-y-4">
		<div class="panel">
			<h3 class="text-xl font-semibold mb-4 text-center text-text-primary">📊 Статистика</h3>
			
			{#if data.battles.length > 0}
				{@const wins = data.battles.filter(b => b.winnerId === data.hero.id).length}
				{@const losses = data.battles.length - wins}
				{@const winRate = ((wins / data.battles.length) * 100).toFixed(1)}
				
				<div class="space-y-4">
					<div class="text-center">
						<p class="text-2xl font-bold text-text-primary">{data.battles.length}</p>
						<p class="text-xs text-text-muted">Всего боёв</p>
					</div>
					
					<div class="grid grid-cols-2 gap-3">
						<div class="text-center">
							<p class="text-lg font-semibold text-success">🏆 {wins}</p>
							<p class="text-xs text-text-muted">Побед</p>
						</div>
						
						<div class="text-center">
							<p class="text-lg font-semibold text-danger">💀 {losses}</p>
							<p class="text-xs text-text-muted">Поражений</p>
						</div>
					</div>
					
					<div class="text-center border-t border-border-light pt-4">
						<p class="text-lg font-semibold" class:text-success={parseFloat(winRate) >= 50} class:text-danger={parseFloat(winRate) < 50}>
							{winRate}%
						</p>
						<p class="text-xs text-text-muted">Процент побед</p>
					</div>
				</div>
			{:else}
				<div class="text-center text-text-muted">
					<p class="text-3xl mb-2">📈</p>
					<p class="text-sm">Статистика появится после первых боёв</p>
				</div>
			{/if}
		</div>
	</div>
</GameLayout>

