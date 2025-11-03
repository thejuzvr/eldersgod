<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	
	const navItems = [
		{ path: '/game', label: 'Дневник', icon: '📜' },
		{ path: '/game/hero', label: 'Герой', icon: '⚔️' },
		{ path: '/game/inventory', label: 'Инвентарь', icon: '🎒' },
		{ path: '/game/arena', label: 'Арена', icon: '⚔️' },
		{ path: '/game/map', label: 'Карта', icon: '🗺️' },
		{ path: '/game/skills', label: 'Умения', icon: '📚' },
		{ path: '/game/leaderboard', label: 'Рейтинг', icon: '🏆' },
		{ path: '/game/wiki', label: 'Wiki', icon: '📖' },
		{ path: '/game/ideas', label: 'Идеи', icon: '💡' }
	];
	
	$: currentPath = $page.url.pathname;
	
	function isActive(path: string): boolean {
		return currentPath === path;
	}
</script>

<nav class="bg-bg-primary border-b border-border-light shadow-sm sticky top-0 z-40">
	<div class="max-w-7xl mx-auto px-4">
		<div class="flex items-center justify-between h-14">
			<!-- Логотип -->
			<button 
				class="flex items-center gap-2 hover:opacity-80 transition-opacity"
				on:click={() => goto('/game')}
			>
				<span class="text-2xl">⚔️</span>
				<span class="font-semibold text-text-primary hidden md:block">Elder Scrolls</span>
			</button>
			
			<!-- Навигация -->
			<div class="flex items-center gap-1 overflow-x-auto">
				{#each navItems as item}
					<button
						class="px-3 py-2 rounded text-sm font-medium transition-all whitespace-nowrap"
						class:bg-accent-primary={isActive(item.path)}
						class:text-bg-primary={isActive(item.path)}
						class:text-text-secondary={!isActive(item.path)}
						class:hover:bg-bg-tertiary={!isActive(item.path)}
						on:click={() => goto(item.path)}
					>
						<span class="mr-1">{item.icon}</span>
						<span class="hidden sm:inline">{item.label}</span>
					</button>
				{/each}
			</div>
		</div>
	</div>
</nav>

