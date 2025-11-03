import { getHeroLastEvent, setHeroLastEvent } from '$lib/server/redis';
import { generateIdleEvent } from './eventGenerator';
import { db } from '$lib/server/db';
import { eventsLog, heroes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { publishEventToHero } from '$lib/server/redis';

/**
 * Проверить idle время героя и сгенерировать события
 */
export async function checkIdleHero(heroId: number) {
	try {
		const lastEventTime = await getHeroLastEvent(heroId);
		const now = Date.now();
		
		if (!lastEventTime) {
			return; // Нет данных о последнем событии
		}
		
		const idleTime = now - lastEventTime;
		
		// 30 секунд idle
		if (idleTime >= 30000 && idleTime < 120000) {
			await generateIdleEventForHero(heroId, idleTime, '30sec');
		}
		// 2 минуты idle
		else if (idleTime >= 120000 && idleTime < 300000) {
			await generateIdleEventForHero(heroId, idleTime, '2min');
		}
		// 5 минут idle - пассивная игра
		else if (idleTime >= 300000) {
			await generateIdleEventForHero(heroId, idleTime, '5min');
		}
	} catch (error) {
		console.error(`Error checking idle for hero ${heroId}:`, error);
	}
}

/**
 * Сгенерировать idle событие для героя
 */
async function generateIdleEventForHero(heroId: number, idleTime: number, tier: string) {
	try {
		// Получаем героя
		const hero = await db.query.heroes.findFirst({
			where: eq(heroes.id, heroId)
		});
		
		if (!hero) return;
		
		// Генерируем idle событие
		const event = generateIdleEvent(hero, idleTime);
		
		// Сохраняем в БД (только раз в период)
		const recentEvents = await db.query.eventsLog.findMany({
			where: eq(eventsLog.heroId, heroId),
			orderBy: (eventsLog, { desc }) => [desc(eventsLog.timestamp)],
			limit: 1
		});
		
		// Проверяем, не было ли недавно idle события
		if (recentEvents.length > 0 && recentEvents[0].eventType === 'idle') {
			const timeSinceLastIdle = Date.now() - new Date(recentEvents[0].timestamp).getTime();
			if (timeSinceLastIdle < 60000) { // Меньше минуты
				return; // Не спамим idle событиями
			}
		}
		
		// Сохраняем
		const [savedEvent] = await db.insert(eventsLog).values({
			heroId: heroId,
			eventType: 'idle',
			content: event
		}).returning();
		
		// Публикуем
		await publishEventToHero(heroId, {
			...event,
			id: savedEvent.id,
			timestamp: savedEvent.timestamp
		});
		
		// Обновляем время последнего события
		await setHeroLastEvent(heroId, Date.now());
		
	} catch (error) {
		console.error(`Error generating idle event for hero ${heroId}:`, error);
	}
}

/**
 * Запуск проверки idle для всех активных героев
 */
export async function startIdleDetector() {
	setInterval(async () => {
		try {
			// Получаем всех активных героев
			const activeHeroes = await db.query.heroes.findMany({
				where: eq(heroes.isActive, true)
			});
			
			// Проверяем каждого
			for (const hero of activeHeroes) {
				await checkIdleHero(hero.id);
			}
		} catch (error) {
			console.error('Error in idle detector:', error);
		}
	}, 30000); // Проверка каждые 30 секунд
	
	console.log('Idle Detector started');
}

