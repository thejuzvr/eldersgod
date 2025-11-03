import { db } from './db';
import { heroes, eventsLog } from './db/schema';
import { eq } from 'drizzle-orm';
import {
	getActiveHeroes,
	getHeroLastEvent,
	setHeroLastEvent,
	publishEventToHero,
	getCachedHeroData,
	cacheHeroData,
	invalidateHeroCache
} from './redis';
import { generateEvent } from '$lib/game/eventGenerator';
import { applyEventRewards } from '$lib/game/progression';

const EVENT_INTERVAL_MIN = 15000; // 15 секунд
const EVENT_INTERVAL_MAX = 180000; // 180 секунд (3 минуты)

/**
 * Главный процессор событий - запускается периодически
 */
export async function processEventQueue() {
	try {
		const activeHeroes = await getActiveHeroes();
		const now = Date.now();

		for (const heroId of activeHeroes) {
			const lastEventTime = await getHeroLastEvent(heroId);
			
			// Проверяем минимальный интервал (событие не чаще чем раз в EVENT_INTERVAL_MIN)
			if (!lastEventTime || (now - lastEventTime) >= EVENT_INTERVAL_MIN) {
				// Дополнительная проверка: случайность в пределах MAX
				const timeSinceLastEvent = lastEventTime ? now - lastEventTime : EVENT_INTERVAL_MAX;
				const chanceToGenerate = Math.min(timeSinceLastEvent / EVENT_INTERVAL_MAX, 1);
				
				// Генерируем событие с учетом вероятности
				if (Math.random() < chanceToGenerate) {
					await generateAndProcessEvent(heroId);
				}
			}
		}
	} catch (error) {
		console.error('Error processing event queue:', error);
	}
}

/**
 * Генерировать и обработать событие для героя
 */
async function generateAndProcessEvent(heroId: number) {
	try {
		// Получаем данные героя (с кэшированием)
		let hero = await getCachedHeroData(heroId);
		
		if (!hero) {
			const heroData = await db.query.heroes.findFirst({
				where: eq(heroes.id, heroId),
				with: {
					inventory: {
						with: {
							item: true
						}
					}
				}
			});
			
			if (!heroData) return;
			
			hero = heroData;
			await cacheHeroData(heroId, hero);
		}

		// Генерируем событие
		const event = await generateEvent(hero);

		// Сохраняем в БД
		const [savedEvent] = await db.insert(eventsLog).values({
			heroId: heroId,
			eventType: event.type,
			content: event
		}).returning();

		// Применяем награды/изменения (включая урон HP)
		if (event.rewards || event.healthChange) {
			await applyEventRewards(heroId, event.rewards || {}, event.healthChange);
			await invalidateHeroCache(heroId); // Инвалидируем кэш после изменений
		}

		// Обновляем время последнего события
		await setHeroLastEvent(heroId, Date.now());
		
		await db.update(heroes)
			.set({ lastEventAt: new Date() })
			.where(eq(heroes.id, heroId));

		// Публикуем событие через Redis для SSE
		await publishEventToHero(heroId, {
			...event,
			id: savedEvent.id,
			timestamp: savedEvent.timestamp
		});

	} catch (error) {
		console.error(`Error generating event for hero ${heroId}:`, error);
	}
}

/**
 * Запуск обработчика очереди (периодический)
 */
export function startEventQueueProcessor() {
	// Запускаем обработку каждые 2 секунды
	setInterval(() => {
		processEventQueue();
	}, 2000);

	console.log('Event Queue Processor started');
}

/**
 * Добавить героя в систему событий
 */
export async function activateHeroEvents(heroId: number) {
	const { addHeroToActiveQueue } = await import('./redis');
	await addHeroToActiveQueue(heroId);
	
	// Сразу генерируем первое событие
	await generateAndProcessEvent(heroId);
}

/**
 * Убрать героя из системы событий
 */
export async function deactivateHeroEvents(heroId: number) {
	const { removeHeroFromActiveQueue } = await import('./redis');
	await removeHeroFromActiveQueue(heroId);
}

/**
 * Принудительно сгенерировать событие (для интерактивной кнопки)
 */
export async function forceGenerateEvent(heroId: number, eventType?: string) {
	await generateAndProcessEvent(heroId);
}

