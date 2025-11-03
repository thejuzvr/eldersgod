import { createClient } from 'redis';
import { REDIS_URL } from '$env/static/private';

// Парсим URL для извлечения номера БД
const parseRedisUrl = (url: string) => {
	const match = url.match(/\/(\d+)$/);
	const database = match ? parseInt(match[1]) : 0;
	const baseUrl = url.replace(/\/\d+$/, '');
	return { url: baseUrl, database };
};

const { url: baseUrl, database } = parseRedisUrl(REDIS_URL);

// Создаём клиент Redis с указанной БД
const redisClient = createClient({
	url: baseUrl,
	database: database
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

// Подключаемся к Redis
await redisClient.connect();

export { redisClient };

// Утилиты для работы с очередями событий

/**
 * Добавить героя в очередь активных героев
 */
export async function addHeroToActiveQueue(heroId: number) {
	await redisClient.sAdd('active_heroes', heroId.toString());
}

/**
 * Удалить героя из очереди активных героев
 */
export async function removeHeroFromActiveQueue(heroId: number) {
	await redisClient.sRem('active_heroes', heroId.toString());
}

/**
 * Получить всех активных героев
 */
export async function getActiveHeroes(): Promise<number[]> {
	const heroes = await redisClient.sMembers('active_heroes');
	return heroes.map(h => parseInt(h));
}

/**
 * Установить последнее событие героя (для отслеживания времени)
 */
export async function setHeroLastEvent(heroId: number, timestamp: number) {
	await redisClient.hSet('hero_last_events', heroId.toString(), timestamp.toString());
}

/**
 * Получить время последнего события героя
 */
export async function getHeroLastEvent(heroId: number): Promise<number | null> {
	const timestamp = await redisClient.hGet('hero_last_events', heroId.toString());
	return timestamp ? parseInt(timestamp) : null;
}

/**
 * Добавить героя в очередь арены
 */
export async function addHeroToArenaQueue(heroId: number, heroLevel: number) {
	// Сохраняем уровень героя для матчмейкинга
	await redisClient.zAdd('arena_queue', { score: heroLevel, value: heroId.toString() });
}

/**
 * Удалить героя из очереди арены
 */
export async function removeHeroFromArenaQueue(heroId: number) {
	await redisClient.zRem('arena_queue', heroId.toString());
}

/**
 * Найти противника для арены (по уровню ±3)
 */
export async function findArenaOpponent(heroId: number, heroLevel: number): Promise<number | null> {
	const minLevel = heroLevel - 3;
	const maxLevel = heroLevel + 3;
	
	const opponents = await redisClient.zRangeByScore('arena_queue', minLevel, maxLevel);
	
	// Исключаем самого героя
	const validOpponents = opponents.filter(id => parseInt(id) !== heroId);
	
	if (validOpponents.length === 0) return null;
	
	// Возвращаем случайного противника
	const randomIndex = Math.floor(Math.random() * validOpponents.length);
	return parseInt(validOpponents[randomIndex]);
}

/**
 * Кэшировать данные героя
 */
export async function cacheHeroData(heroId: number, data: any, ttl: number = 300) {
	await redisClient.setEx(`hero:${heroId}`, ttl, JSON.stringify(data));
}

/**
 * Получить кэшированные данные героя
 */
export async function getCachedHeroData(heroId: number): Promise<any | null> {
	const data = await redisClient.get(`hero:${heroId}`);
	return data ? JSON.parse(data) : null;
}

/**
 * Удалить кэш героя
 */
export async function invalidateHeroCache(heroId: number) {
	await redisClient.del(`hero:${heroId}`);
}

/**
 * Publish событие для конкретного героя (для SSE)
 */
export async function publishEventToHero(heroId: number, event: any) {
	await redisClient.publish(`hero:${heroId}:events`, JSON.stringify(event));
}

/**
 * Subscribe на события героя
 */
export async function subscribeToHeroEvents(heroId: number, callback: (event: any) => void) {
	const subscriber = redisClient.duplicate();
	await subscriber.connect();
	
	await subscriber.subscribe(`hero:${heroId}:events`, (message) => {
		const event = JSON.parse(message);
		callback(event);
	});
	
	return subscriber;
}

