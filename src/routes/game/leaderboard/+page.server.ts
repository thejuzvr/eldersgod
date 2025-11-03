import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { heroes } from '$lib/server/db/schema';
import { desc, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Проверяем авторизацию
	if (!locals.user || !locals.hero) {
		throw redirect(303, '/auth/login');
	}
	
	// Генерируем разные рейтинги
	const leaderboards: any = {};
	
	try {
		// Мастерства (по уровню)
		const masteryLeaders = await db.select({
			name: heroes.name,
			race: heroes.race,
			level: heroes.level,
			motto: sql<string>`NULL`,
			guild: sql<string>`NULL`,
			score: heroes.level
		})
		.from(heroes)
		.orderBy(desc(heroes.level), desc(heroes.experience))
		.limit(100);
		
		leaderboards.mastery = masteryLeaders;
		
		// Строительства (по золоту)
		const constructionLeaders = await db.select({
			name: heroes.name,
			race: heroes.race,
			level: heroes.level,
			motto: sql<string>`NULL`,
			guild: sql<string>`NULL`,
			score: heroes.gold
		})
		.from(heroes)
		.orderBy(desc(heroes.gold))
		.limit(100);
		
		leaderboards.construction = constructionLeaders;
		
		// Живучести (по HP)
		const sailingLeaders = await db.select({
			name: heroes.name,
			race: heroes.race,
			level: heroes.level,
			motto: sql<string>`NULL`,
			guild: sql<string>`NULL`,
			score: heroes.maxHealth
		})
		.from(heroes)
		.orderBy(desc(heroes.maxHealth))
		.limit(100);
		
		leaderboards.sailing = sailingLeaders;
		
		// Созидания (по душам драконов)
		const creationLeaders = await db.select({
			name: heroes.name,
			race: heroes.race,
			level: heroes.level,
			motto: sql<string>`NULL`,
			guild: sql<string>`NULL`,
			score: heroes.dragonSouls
		})
		.from(heroes)
		.orderBy(desc(heroes.dragonSouls))
		.limit(100);
		
		leaderboards.creation = creationLeaders;
		
		// Остальные пантеоны пока пустые (можно добавить позже)
		leaderboards.solidarity = [];
		leaderboards.military = [];
		leaderboards.adventure = [];
		
	} catch (error) {
		console.error('Error loading leaderboards:', error);
	}
	
	return {
		hero: locals.hero,
		leaderboards,
		yourRank: null // TODO: вычислить место героя
	};
};

