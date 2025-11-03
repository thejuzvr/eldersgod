<script lang="ts">
	export let hero: any;
	
	$: expProgress = hero ? ((hero.experience % getExpForNextLevel(hero.level)) / getExpForNextLevel(hero.level)) * 100 : 0;
	$: healthProgress = hero ? (hero.currentHealth / hero.maxHealth) * 100 : 100;
	
	function getExpForNextLevel(level: number): number {
		return Math.floor(100 * Math.pow(1.5, level));
	}
</script>

<div class="panel card-shadow">
	<div class="text-center mb-4">
		<div class="text-4xl mb-3">⚔️</div>
		<h2 class="text-2xl font-semibold mb-1">{hero?.name || 'Герой'}</h2>
		<p class="text-text-secondary text-sm">{hero?.title || 'Новичок'}</p>
		<p class="text-xs text-text-muted mt-1">{hero?.race || 'Человек'}</p>
		{#if hero?.currentLocation}
			<p class="text-xs text-info mt-1">📍 {hero.currentLocation}</p>
		{/if}
	</div>
	
	<!-- Уровень -->
	<div class="mb-4 text-center">
		<div class="inline-block bg-accent-primary text-bg-primary px-5 py-1.5 rounded font-semibold text-sm">
			Уровень {hero?.level || 1}
		</div>
	</div>
	
	<!-- Здоровье -->
	<div class="mb-4">
		<div class="flex justify-between mb-2">
			<span class="text-sm font-medium">❤️ Здоровье</span>
			<span class="text-sm text-text-muted">{hero?.currentHealth || 100} / {hero?.maxHealth || 100}</span>
		</div>
		<div class="stat-bar">
			<div class="stat-bar-fill" style="width: {healthProgress}%; background: var(--danger);"></div>
		</div>
	</div>
	
	<!-- Опыт -->
	<div class="mb-4">
		<div class="flex justify-between mb-2">
			<span class="text-sm font-medium">⭐ Опыт</span>
			<span class="text-sm text-text-muted">{hero?.experience || 0} / {getExpForNextLevel(hero?.level || 1)}</span>
		</div>
		<div class="stat-bar">
			<div class="stat-bar-fill" style="width: {expProgress}%;"></div>
		</div>
	</div>
	
	<!-- Характеристики -->
	<div class="grid grid-cols-3 gap-2 mb-4">
		<div class="text-center p-3 bg-bg-secondary rounded border border-border-light">
			<div class="text-xl mb-1">💪</div>
			<div class="text-xs text-text-muted">Сила</div>
			<div class="text-lg font-semibold text-text-primary">{hero?.strength || 10}</div>
		</div>
		
		<div class="text-center p-3 bg-bg-secondary rounded border border-border-light">
			<div class="text-xl mb-1">🧠</div>
			<div class="text-xs text-text-muted">Интеллект</div>
			<div class="text-lg font-semibold text-text-primary">{hero?.intelligence || 10}</div>
		</div>
		
		<div class="text-center p-3 bg-bg-secondary rounded border border-border-light">
			<div class="text-xl mb-1">🍀</div>
			<div class="text-xs text-text-muted">Удача</div>
			<div class="text-lg font-semibold text-text-primary">{hero?.luck || 10}</div>
		</div>
	</div>
	
	<!-- Валюты -->
	<div class="grid grid-cols-2 gap-2 mb-4">
		<div class="p-3 bg-bg-secondary rounded border border-border-light">
			<div class="flex items-center justify-between">
				<span class="text-xl">💰</span>
				<div class="text-right">
					<div class="text-xs text-text-muted">Золото</div>
					<div class="text-base font-semibold text-text-primary">{hero?.gold || 0}</div>
				</div>
			</div>
		</div>
		
		<div class="p-3 bg-bg-secondary rounded border border-border-light">
			<div class="flex items-center justify-between">
				<span class="text-xl">🔥</span>
				<div class="text-right">
					<div class="text-xs text-text-muted">Души</div>
					<div class="text-base font-semibold text-warning">{hero?.dragonSouls || 0}</div>
				</div>
			</div>
		</div>
	</div>
	
	<!-- Кнопка к странице героя -->
	<a href="/game/hero" class="block">
		<button class="btn w-full text-sm">
			👤 Подробнее о герое
		</button>
	</a>
</div>


