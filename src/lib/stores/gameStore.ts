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

export interface Notification {
	id: string;
	title: string;
	message: string;
	type: 'info' | 'success' | 'warning' | 'error';
	timestamp: number;
	read: boolean;
}

export const notificationsStore: Writable<Notification[]> = writable([]);

export function addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) {
	const newNotification: Notification = {
		...notification,
		id: Math.random().toString(36).substring(2, 9),
		timestamp: Date.now(),
		read: false
	};
	notificationsStore.update(notifications => [newNotification, ...notifications]);
}

export function markNotificationAsRead(id: string) {
	notificationsStore.update(notifications =>
		notifications.map(n => n.id === id ? { ...n, read: true } : n)
	);
}

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
			if (data.event.type === 'skill') {
				addNotification({
					title: 'Новое умение!',
					message: data.event.title,
					type: 'success'
				});
			}
		} else if (data.type === 'hero_update') {
			heroStore.set(data.hero);
		} else if (data.type === 'encounter') {
			encountersStore.update(encounters => [...encounters, data.encounter]);
			addNotification({
				title: 'Встреча героев',
				message: 'Вы встретили другого героя в пути!',
				type: 'info'
			});
		} else if (data.type === 'arena_battle') {
			// Обновляем арену
			arenaStore.update(arena => ({
				...arena,
				battles: [data.battle, ...arena.battles]
			}));
			addNotification({
				title: 'Битва на арене завершена',
				message: 'Ваш герой завершил сражение на арене.',
				type: 'info'
			});
		} else if (data.type === 'divine_intervention') {
			addNotification({
				title: data.intervention.type === 'bless' ? 'Благословение богов' : 'Гнев богов',
				message: data.intervention.message,
				type: data.intervention.type === 'bless' ? 'success' : 'error'
			});
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

