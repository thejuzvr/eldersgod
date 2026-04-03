import { db } from '$lib/server/db';
import { heroEncounters, heroes } from '$lib/server/db/schema';
import { ne } from 'drizzle-orm';

import { and, eq, or, desc } from 'drizzle-orm';
import { publishEventToHero } from '$lib/server/redis';

// Шаблоны встреч
const encounterTemplates = {
	robbery: [
		'{hero1} попытался ограбить {hero2}, но украл лишь дырявый носок!',
		'{hero1} вытащил кошелек у {hero2}, а там только сыр!',
		'{hero1} напал на {hero2} ради золота, но они заговорились о погоде.'
	],
	chat: [
		'{hero1} и {hero2} обсудили последние сплетни о грязевых крабах.',
		'{hero1} пожаловался {hero2} на цены в тавернах.',
		'{hero1} и {hero2} поделились секретом заварки травяного чая.'
	],
	brawl: [
		'{hero1} и {hero2} подрались из-за сладкого рулета!',
		'{hero1} случайно наступил на ногу {hero2}. Началась великая битва!',
		'{hero1} назвал {hero2} молочным пьющим. Развязалась потасовка в грязи.'
	],
	comedy: [
		'{hero1} попытался напугать {hero2}, но поскользнулся на банановой кожуре!',
		'{hero1} и {hero2} одновременно сказали одно и то же и теперь обязаны купить друг другу эль.',
		'{hero1} чихнул, и {hero2} подумал, что это боевой клич дракона.'
	]
};

/**
 * Сгенерировать случайную встречу между героями
 */
export async function generateRandomEncounter(heroId: number) {
	// Ищем текущего героя
	const currentHero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId)
	});

	if (!currentHero || !currentHero.currentLocation) return null;

	// Получаем других героев в той же локации
	const otherHeroes = await db.query.heroes.findMany({
		where: and(
			ne(heroes.id, heroId),
			eq(heroes.currentLocation, currentHero.currentLocation)
		),
		limit: 10
	});
	
	if (otherHeroes.length === 0) {
		return null; // Нет других героев в локации
	}
	
	const randomHero = otherHeroes[Math.floor(Math.random() * otherHeroes.length)];

	// Проверяем, встречались ли они уже в течение последнего часа (колдаун)
	const recentEncounter = await db.query.heroEncounters.findFirst({
		where: and(
			or(
				and(eq(heroEncounters.hero1Id, heroId), eq(heroEncounters.hero2Id, randomHero.id)),
				and(eq(heroEncounters.hero1Id, randomHero.id), eq(heroEncounters.hero2Id, heroId))
			)
		),
		orderBy: [desc(heroEncounters.timestamp)]
	});

	if (recentEncounter) {
		const encounterTime = new Date(recentEncounter.timestamp).getTime();
		const now = new Date().getTime();
		if (now - encounterTime < 60 * 60 * 1000) {
			// Skip - уже встречались за последний час
			return null;
		}
	}
	
	// Выбираем случайный тип встречи
	const types = Object.keys(encounterTemplates) as Array<keyof typeof encounterTemplates>;
	const randomType = types[Math.floor(Math.random() * types.length)];
	
	// Выбираем случайный шаблон
	const templates = encounterTemplates[randomType];
	const template = templates[Math.floor(Math.random() * templates.length)];
	
	// Заполняем шаблон
	const description = template
		.replace('{hero1}', currentHero.name)
		.replace('{hero2}', randomHero.name);
	
	// Сохраняем встречу
	const [encounter] = await db.insert(heroEncounters).values({
		hero1Id: heroId,
		hero2Id: randomHero.id,
		encounterType: randomType,
		description: description
	}).returning();
	
	// Отправляем уведомления обоим героям по SSE
	await publishEventToHero(heroId, { type: 'encounter', encounter });
	await publishEventToHero(randomHero.id, { type: 'encounter', encounter });

	return encounter;
}

/**
 * Периодическая генерация встреч
 */
export async function processEncounters() {
	try {
		// Получаем всех активных героев
		const allHeroes = await db.query.heroes.findMany({
			where: ne(heroes.isActive, false)
		});
		
		// Генерируем встречи с 20% вероятностью для каждого героя
		for (const hero of allHeroes) {
			if (Math.random() < 0.2) { // 20% шанс
				await generateRandomEncounter(hero.id);
			}
		}
	} catch (error) {
		console.error('Error processing encounters:', error);
	}
}

