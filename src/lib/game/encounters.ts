import { db } from '$lib/server/db';
import { heroEncounters, heroes } from '$lib/server/db/schema';
import { ne } from 'drizzle-orm';

// Шаблоны встреч
const encounterTemplates = {
	rescue: [
		'{hero1} спас {hero2} от падающего дракона!',
		'{hero1} вытащил {hero2} из колодца с говорящими камнями!',
		'{hero1} спас {hero2} от агрессивного хлеба!',
		'{hero1} защитил {hero2} от кекса-дракона!'
	],
	theft: [
		'{hero1} украл сыр у {hero2}... и вернул с маслом!',
		'{hero1} случайно взял носок {hero2}... оказалось, он телепортный!',
		'{hero1} украл меч {hero2}... который был ложкой.',
		'{hero1} позаимствовал золото {hero2}... и оставил расписку.'
	],
	adventure: [
		'{hero1} и {hero2} вместе нашли говорящий гриб!',
		'{hero1} с {hero2} открыли таверну для облаков!',
		'{hero1} и {hero2} станцевали с папоротниками!',
		'{hero1} помог {hero2} философствовать с лошадью!'
	],
	mention: [
		'{hero1} упомянул {hero2} в разговоре с ковром-торговцем!',
		'{hero1} рассказал дракону историю о подвигах {hero2}!',
		'{hero1} написал балладу о {hero2} (рифмы не сошлись)!',
		'{hero1} нарисовал портрет {hero2} на облаке!'
	],
	absurd: [
		'{hero1} и {hero2} одновременно превратились в сыр!',
		'{hero1} случайно призвал {hero2} вместо дракона!',
		'{hero1} и {hero2} обменялись носками... в разных измерениях!',
		'{hero1} встретил будущую версию {hero2} из прошлого!'
	]
};

/**
 * Сгенерировать случайную встречу между героями
 */
export async function generateRandomEncounter(heroId: number) {
	// Получаем случайного другого героя
	const otherHeroes = await db.query.heroes.findMany({
		where: ne(heroes.id, heroId),
		limit: 10
	});
	
	if (otherHeroes.length === 0) {
		return null; // Нет других героев
	}
	
	const randomHero = otherHeroes[Math.floor(Math.random() * otherHeroes.length)];
	const currentHero = await db.query.heroes.findFirst({
		where: ne(heroes.id, heroId)
	});
	
	if (!currentHero) return null;
	
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

