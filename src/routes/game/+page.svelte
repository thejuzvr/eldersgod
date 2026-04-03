<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import GameLayout from '$lib/components/GameLayout.svelte';
	import HeroPanel from '$lib/components/HeroPanel.svelte';
	import EventScroll from '$lib/components/EventScroll.svelte';
	import ArenaPanel from '$lib/components/ArenaPanel.svelte';
	import EncountersPanel from '$lib/components/EncountersPanel.svelte';
	import HeroThought from '$lib/components/HeroThought.svelte';
	import QuestsPanel from '$lib/components/QuestsPanel.svelte';
	import DivinePower from '$lib/components/DivinePower.svelte';
	import QuizMinigame from '$lib/components/minigames/QuizMinigame.svelte';
	import { heroStore, eventsStore, encountersStore, arenaStore, connectEventStream, activateHero, deactivateHero } from '$lib/stores/gameStore';
	
	export let data;
	
	let unsubscribeSSE: (() => void) | null = null;
	let unsubscribeHero: (() => void) | null = null;
	let unsubscribeEvents: (() => void) | null = null;
	let unsubscribeEncounters: (() => void) | null = null;
	let unsubscribeArena: (() => void) | null = null;
	
	let hero: any = null;
	let events: any[] = [];
	let encounters: any[] = [];
	let arena: any = { inQueue: false, opponents: [], battles: [] };
	let quests: any[] = [];
	
	let showQuiz = false;
	
	// Примеры квестов (в реальности будут загружаться с сервера)
	const sampleQuests = [
		{
			id: 1,
			icon: '🐉',
			title: 'Первые шаги',
			description: 'Познакомьтесь с основами игры',
			status: 'active',
			subtasks: [
				{ id: 1, title: 'Получите 5 событий', completed: true },
				{ id: 2, title: 'Достигните 2 уровня', completed: false },
				{ id: 3, title: 'Заработайте 100 золота', completed: false }
			],
			rewards: { exp: 200, gold: 100 }
		},
		{
			id: 2,
			icon: '⚔️',
			title: 'Боец арены',
			description: 'Покажите свою силу на арене',
			status: 'active',
			subtasks: [
				{ id: 1, title: 'Встаньте в очередь арены', completed: false },
				{ id: 2, title: 'Выиграйте первый бой', completed: false },
				{ id: 3, title: 'Выиграйте 3 боя', completed: false }
			],
			rewards: { exp: 300, gold: 150 }
		}
	];
	
	onMount(async () => {
		// Проверяем авторизацию
		if (!data.hero) {
			goto('/auth/login');
			return;
		}
		
		// Устанавливаем героя в store (приводим к правильному типу)
		heroStore.set(data.hero as any);
		
		// Загружаем квесты (пока используем примеры)
		quests = sampleQuests;
		
		// Подписываемся на изменения
		unsubscribeHero = heroStore.subscribe(value => {
			hero = value;
		});
		
		unsubscribeEvents = eventsStore.subscribe(value => {
			events = value;
		});
		
		unsubscribeEncounters = encountersStore.subscribe(value => {
			encounters = value;
		});
		
		unsubscribeArena = arenaStore.subscribe(value => {
			arena = value;
		});
		
		// Загружаем начальные события
		await loadInitialEvents();
		
		// Активируем героя
		await activateHero(data.hero.id);
		
		// Подключаемся к SSE
		unsubscribeSSE = connectEventStream(data.hero.id);
	});
	
	onDestroy(async () => {
		// Отписываемся от всего
		if (unsubscribeSSE) unsubscribeSSE();
		if (unsubscribeHero) unsubscribeHero();
		if (unsubscribeEvents) unsubscribeEvents();
		if (unsubscribeEncounters) unsubscribeEncounters();
		if (unsubscribeArena) unsubscribeArena();
		
		// Деактивируем героя
		if (data.hero) {
			await deactivateHero(data.hero.id);
		}
	});
	
	async function loadInitialEvents() {
		try {
			const response = await fetch(`/api/events/${data.hero.id}`);
			const data_events = await response.json();
			
			if (data_events.success) {
				eventsStore.set(data_events.events);
			}
		} catch (error) {
			console.error('Failed to load events:', error);
		}
	}
	
	async function handleJoinArena() {
		try {
			const response = await fetch('/api/arena/queue', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ heroId: data.hero.id })
			});
			
			const result = await response.json();
			
			if (result.success) {
				arenaStore.update(a => ({ ...a, inQueue: true }));
			}
		} catch (error) {
			console.error('Failed to join arena:', error);
		}
	}
	
	async function handleLogout() {
		try {
			await fetch('/api/auth/logout', {
				method: 'POST'
			});
			
			goto('/');
		} catch (error) {
			console.error('Logout failed:', error);
		}
	}
	
	function handleThoughtClick() {
		showQuiz = true;
	}
	
	async function handleMinigameWin(event: CustomEvent) {
		const { reward } = event.detail;
		
		// Отправляем награду на сервер
		try {
			await fetch(`/api/hero/${data.hero.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					experience: (hero?.experience || 0) + (reward.exp || 0),
					gold: (hero?.gold || 0) + (reward.gold || 0)
				})
			});
			
			// Обновляем локальное состояние
			if (hero) {
				hero.experience = (hero.experience || 0) + (reward.exp || 0);
				hero.gold = (hero.gold || 0) + (reward.gold || 0);
				heroStore.set(hero);
			}
		} catch (error) {
			console.error('Failed to apply minigame reward:', error);
		}
		
		showQuiz = false;
	}
	
	function handleMinigameLose() {
		showQuiz = false;
	}
	
	function handleMinigameClose() {
		showQuiz = false;
	}
</script>

<svelte:head>
	<title>Игра | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout>
	<!-- Левая панель - Герой -->
	<div slot="left-panel" class="space-y-4">
		<HeroPanel {hero} />
		
		<!-- Быстрая статистика -->
		<div class="panel">
			<h3 class="text-sm font-semibold mb-3 text-text-primary text-center">📊 Статистика</h3>
			<div class="space-y-2">
				<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
					<span class="text-xs text-text-muted">Всего событий</span>
					<span class="text-sm font-semibold text-text-primary">{events.length}</span>
				</div>
				<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
					<span class="text-xs text-text-muted">Встречи</span>
					<span class="text-sm font-semibold text-text-primary">{encounters.length}</span>
				</div>
				<div class="flex justify-between items-center p-2 bg-bg-secondary rounded">
					<span class="text-xs text-text-muted">Боёв на арене</span>
					<span class="text-sm font-semibold text-text-primary">{arena.battles?.length || 0}</span>
				</div>
			</div>
		</div>
		
		<!-- Кнопки навигации -->
		<div class="space-y-2">
			<button class="btn w-full text-sm" on:click={() => goto('/game/arena')}>
				⚔️ Арена
			</button>
			<button class="btn w-full text-sm" on:click={handleLogout}>
				🚪 Выйти
			</button>
		</div>
	</div>
	
	<!-- Центр - Дневник -->
	<div slot="center" class="space-y-3">
		<!-- Статус-бар -->
		<div class="panel p-3">
			<div class="flex items-center justify-between flex-wrap gap-2">
				<div class="flex items-center gap-3">
					<div class="w-3 h-3 bg-success rounded-full animate-pulse"></div>
					<span class="text-sm font-medium text-text-primary">Герой активен</span>
				</div>
				<div class="flex items-center gap-4 text-xs text-text-muted">
					<span>⏱️ События каждые 15-180 сек</span>
					<span>📝 {events.length} событий</span>
				</div>
			</div>
		</div>
		
		<!-- Мысли героя -->
		<HeroThought on:click={handleThoughtClick} />
		
		<!-- Дневник событий -->
		<div class="h-[calc(100vh-16rem)]">
			<EventScroll {events} />
		</div>
	</div>
	
	<!-- Правая панель - Божественный пульт, Квесты, Арена и Встречи -->
	<div slot="right-panel" class="space-y-4">
		<DivinePower heroId={data.hero.id} currentPrayer={100} />
		
		<QuestsPanel {quests} />
		
		<ArenaPanel 
			opponents={arena.opponents}
			inQueue={arena.inQueue}
			on:joinQueue={handleJoinArena}
			on:viewBattles={() => goto('/game/arena')}
		/>
		
		<EncountersPanel {encounters} />
	</div>
</GameLayout>

<!-- Мини-игра (TES Quiz) -->
{#if showQuiz}
	<QuizMinigame
		on:win={handleMinigameWin}
		on:lose={handleMinigameLose}
		on:close={handleMinigameClose}
	/>
{/if}
