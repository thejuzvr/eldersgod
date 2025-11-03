<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	import { goto } from '$app/navigation';
	
	export let data;
	
	const regions = [
		{ name: 'Skyrim', color: '#6C757D', locations: ['Вайтран', 'Рифтен', 'Солитьюд', 'Виндхельм', 'Маркарт'] },
		{ name: 'Morrowind', color: '#495057', locations: ['Вивек', 'Балмора', 'Альд-Рун'] },
		{ name: 'Cyrodiil', color: '#495057', locations: ['Имперский Город', 'Бравил', 'Анвил'] },
		{ name: 'Unknown', color: '#ADB5BD', locations: ['Колодец с драконом', 'Пещера говорящих камней', 'Таверна "У мёртвого барда"'] }
	];
	
	let selectedRegion: string | null = null;
</script>

<svelte:head>
	<title>Карта мира | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center" class="space-y-4">
		<div class="panel">
			<h1 class="text-2xl font-bold text-center mb-4 text-text-primary">🗺️ Карта Тамриэля</h1>
			
			<!-- Текущая локация героя -->
			{#if data.hero?.currentLocation}
				<div class="text-center mb-6 p-3 bg-info bg-opacity-10 border border-info rounded">
					<p class="text-sm text-text-secondary">Вы находитесь в:</p>
					<p class="text-lg font-semibold text-info">📍 {data.hero.currentLocation}</p>
				</div>
			{/if}
			
			<!-- Карта (заглушка с SVG) -->
			<div class="relative bg-bg-tertiary rounded-lg overflow-hidden mb-6" style="height: 500px;">
				<div class="absolute inset-0 flex items-center justify-center">
					<div class="text-center">
						<div class="text-8xl mb-4">🗺️</div>
						<p class="text-text-muted">Интерактивная карта</p>
						<p class="text-xs text-text-muted mt-2">Тамриэль во всей красе</p>
					</div>
				</div>
				
				<!-- Сетка для визуализации -->
				<svg class="absolute inset-0 w-full h-full opacity-10">
					<defs>
						<pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
							<path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" stroke-width="1"/>
						</pattern>
					</defs>
					<rect width="100%" height="100%" fill="url(#grid)" />
				</svg>
			</div>
			
			<!-- Регионы -->
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{#each regions as region}
					<div class="panel">
						<button
							class="w-full text-left"
							on:click={() => selectedRegion = selectedRegion === region.name ? null : region.name}
						>
							<h3 class="text-lg font-semibold mb-2 text-text-primary flex items-center justify-between">
								{region.name}
								<span class="text-sm">{selectedRegion === region.name ? '▲' : '▼'}</span>
							</h3>
						</button>
						
						{#if selectedRegion === region.name}
							<div class="mt-3 space-y-2 border-t border-border-light pt-3">
								{#each region.locations as location}
									<div 
										class="p-2 bg-bg-secondary rounded text-sm hover:bg-bg-tertiary transition-all cursor-pointer"
										class:bg-info={data.hero?.currentLocation === location}
										class:bg-opacity-20={data.hero?.currentLocation === location}
										class:border={data.hero?.currentLocation === location}
										class:border-info={data.hero?.currentLocation === location}
									>
										<span class:font-semibold={data.hero?.currentLocation === location}>
											{data.hero?.currentLocation === location ? '📍' : '📌'} {location}
										</span>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				{/each}
			</div>
			
			<!-- Информация -->
			<div class="mt-6 p-4 bg-bg-tertiary rounded border-l-4 border-accent-primary">
				<h4 class="text-sm font-semibold mb-2 text-text-primary">ℹ️ О карте</h4>
				<p class="text-xs text-text-secondary leading-relaxed">
					Ваш герой автоматически путешествует по миру Тамриэля. Некоторые события могут перемещать 
					героя в новые локации. Каждая локация имеет свои особенности и абсурдные детали!
				</p>
			</div>
		</div>
	</div>
</GameLayout>

