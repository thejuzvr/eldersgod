import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export interface HeroState {
	id: number;
	name: string;
	level: number;
	experience: number;
	gold: number;
	dragonSouls: number;
	currentHealth: number;
	maxHealth: number;
	strength: number;
	intelligence: number;
	luck: number;
	title: string;
	race: string;
	currentLocation?: string;
}

// Типы категорий событий
export type EventCategory = 
	| 'event' 			// Обычное событие
	| 'in_combat' 		// Бой/сражение
	| 'exploration' 	// Исследование
	| 'social' 			// Социальное взаимодействие
	| 'quest' 			// Связано с квестом
	| 'trade' 			// Торговля
	| 'rest' 			// Отдых/восстановление
	| 'danger' 			// Опасность/угроза
	| 'reward';			// Награда/находка

export interface GameEvent {
	id?: number;
	type: string;
	category: EventCategory;
	title: string;
	description: string;
	thought?: string;
	rewards?: any;
	timestamp?: Date;
	icon?: string;
	interactive?: boolean;
	location?: string;
	healthChange?: number; // Изменение HP
}

// Stores
export const heroStore: Writable<HeroState | null> = writable(null);
export const eventsStore: Writable<GameEvent[]> = writable([]);
export const encountersStore: Writable<any[]> = writable([]);
export const arenaStore: Writable<{
	inQueue: boolean;
	opponents: any[];
	battles: any[];
}> = writable({
	inQueue: false,
	opponents: [],
	battles: []
});

// Функция для подключения к SSE
export function connectEventStream(heroId: number) {
	// Проверяем, что мы в браузере
	if (typeof window === 'undefined') return () => {};
	
	const eventSource = new EventSource(`/api/events/stream?heroId=${heroId}`);
	
	eventSource.onmessage = (event) => {
		const data = JSON.parse(event.data);
		
		// Обрабатываем разные типы сообщений
		if (data.type === 'event') {
			eventsStore.update(events => [...events, data.event]);
		} else if (data.type === 'hero_update') {
			heroStore.set(data.hero);
		} else if (data.type === 'encounter') {
			encountersStore.update(encounters => [...encounters, data.encounter]);
		} else if (data.type === 'arena_battle') {
			// Обновляем арену
			arenaStore.update(arena => ({
				...arena,
				battles: [data.battle, ...arena.battles]
			}));
		}
	};
	
	eventSource.onerror = (error) => {
		console.error('SSE Error:', error);
		eventSource.close();
		
		// Переподключение через 5 секунд
		setTimeout(() => {
			connectEventStream(heroId);
		}, 5000);
	};
	
	return () => {
		eventSource.close();
	};
}

// Функция для активации героя (запуск событий)
export async function activateHero(heroId: number) {
	try {
		await fetch(`/api/hero/${heroId}/activate`, {
			method: 'POST'
		});
	} catch (error) {
		console.error('Failed to activate hero:', error);
	}
}

// Функция для деactivации героя
export async function deactivateHero(heroId: number) {
	// Проверяем, что мы в браузере
	if (typeof window === 'undefined') return;
	
	try {
		await fetch(`/api/hero/${heroId}/deactivate`, {
			method: 'POST'
		});
	} catch (error) {
		console.error('Failed to deactivate hero:', error);
	}
}

