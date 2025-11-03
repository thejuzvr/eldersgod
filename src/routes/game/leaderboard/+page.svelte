<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	
	export let data;
	
	const pantheons = [
		{ id: 'mastery', name: 'Мастерства', icon: '⚔️', description: 'Самые искусные герои' },
		{ id: 'construction', name: 'Строительства', icon: '🏗️', description: 'Строители храмов' },
		{ id: 'sailing', name: 'Живучести', icon: '❤️', description: 'Герои с наибольшим HP' },
		{ id: 'creation', name: 'Созидания', icon: '🎨', description: 'Авторы идей' },
		{ id: 'solidarity', name: 'Солидарности', icon: '🤝', description: 'Помощники' },
		{ id: 'military', name: 'Воинственности', icon: '⚔️', description: 'Победы на арене' },
		{ id: 'adventure', name: 'Авантюризма', icon: '🎲', description: 'Самые активные' }
	];
	
	let selectedPantheon = 'mastery';
	
	$: currentLeaders = data.leaderboards[selectedPantheon] || [];
	
	function getRankColor(rank: number): string {
		if (rank === 1) return 'text-warning'; // Золото
		if (rank === 2) return 'text-text-muted'; // Серебро
		if (rank === 3) return 'text-warning'; // Бронза
		return 'text-text-secondary';
	}
	
	function getRankIcon(rank: number): string {
		if (rank === 1) return '🥇';
		if (rank === 2) return '🥈';
		if (rank === 3) return '🥉';
		return `${rank}.`;
	}
</script>

<svelte:head>
	<title>Пантеоны | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center" class="space-y-4">
		<div class="panel">
			<h1 class="text-2xl font-bold text-center mb-6 text-text-primary">🏆 Пантеоны</h1>
			
			<!-- Выбор пантеона -->
			<div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
				{#each pantheons as pantheon}
					<button
						class="p-3 rounded border text-center transition-all"
						class:bg-accent-primary={selectedPantheon === pantheon.id}
						class:text-bg-primary={selectedPantheon === pantheon.id}
						class:border-accent-primary={selectedPantheon === pantheon.id}
						class:bg-bg-secondary={selectedPantheon !== pantheon.id}
						class:border-border-light={selectedPantheon !== pantheon.id}
						class:hover:border-border-medium={selectedPantheon !== pantheon.id}
						on:click={() => selectedPantheon = pantheon.id}
						title={pantheon.description}
					>
						<div class="text-2xl mb-1">{pantheon.icon}</div>
						<div class="text-xs font-medium">{pantheon.name}</div>
					</button>
				{/each}
			</div>
			
			<!-- Описание текущего пантеона -->
			<div class="text-center mb-4 p-3 bg-bg-tertiary rounded">
				<p class="text-sm text-text-secondary">
					{pantheons.find(p => p.id === selectedPantheon)?.description}
				</p>
			</div>
			
			<!-- Таблица лидеров -->
			<div class="bg-bg-primary border border-border-light rounded overflow-hidden">
				<table class="w-full">
					<thead class="bg-bg-secondary border-b border-border-light">
						<tr>
							<th class="px-4 py-3 text-left text-xs font-semibold text-text-primary">Место</th>
							<th class="px-4 py-3 text-left text-xs font-semibold text-text-primary">Героиня</th>
							<th class="px-4 py-3 text-left text-xs font-semibold text-text-primary">Девиз</th>
							<th class="px-4 py-3 text-left text-xs font-semibold text-text-primary">Гильдия</th>
							<th class="px-4 py-3 text-right text-xs font-semibold text-text-primary">Уровень</th>
							<th class="px-4 py-3 text-right text-xs font-semibold text-text-primary">Показатель</th>
						</tr>
					</thead>
					<tbody>
						{#each currentLeaders as leader, index}
							<tr class="border-b border-border-light hover:bg-bg-secondary transition-colors">
								<td class="px-4 py-3">
									<span class="text-sm font-semibold {getRankColor(index + 1)}">
										{getRankIcon(index + 1)}
									</span>
								</td>
								<td class="px-4 py-3">
									<div>
										<p class="text-sm font-semibold text-text-primary">{leader.name}</p>
										<p class="text-xs text-text-muted">{leader.race}</p>
									</div>
								</td>
								<td class="px-4 py-3">
									<p class="text-xs italic text-text-secondary">{leader.motto || 'Без девиза'}</p>
								</td>
								<td class="px-4 py-3">
									<p class="text-xs text-text-secondary">{leader.guild || '—'}</p>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="text-sm font-semibold text-text-primary">{leader.level}</span>
								</td>
								<td class="px-4 py-3 text-right">
									<span class="text-sm font-semibold text-accent-primary">
										{leader.score.toLocaleString('ru-RU')}
									</span>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
				
				{#if currentLeaders.length === 0}
					<div class="text-center py-12 text-text-muted">
						<p class="text-base">Пока нет героев в этом пантеоне</p>
						<p class="text-sm mt-2">Станьте первым!</p>
					</div>
				{/if}
			</div>
			
			<!-- Информация о вашем месте -->
			{#if data.yourRank}
				<div class="mt-4 p-4 bg-info bg-opacity-10 border border-info rounded">
					<p class="text-sm font-medium text-text-primary text-center">
						📊 Ваше место: <span class="text-info font-bold">#{data.yourRank}</span>
					</p>
				</div>
			{/if}
		</div>
	</div>
</GameLayout>

