import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { arenaBattles, heroes } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Проверяем авторизацию
	if (!locals.user || !locals.hero) {
		throw redirect(303, '/auth/login');
	}

	const hero = locals.hero;

	// Загружаем битвы арены для героя напрямую из БД
	try {
		const battles = await db.select({
			id: arenaBattles.id,
			hero1Id: arenaBattles.hero1Id,
			hero2Id: arenaBattles.hero2Id,
			winnerId: arenaBattles.winnerId,
			battleLog: arenaBattles.battleLog,
			rewards: arenaBattles.rewards,
			createdAt: arenaBattles.timestamp
		})
		.from(arenaBattles)
		.where(
			or(
				eq(arenaBattles.hero1Id, hero.id),
				eq(arenaBattles.hero2Id, hero.id)
			)
		)
		.orderBy(desc(arenaBattles.timestamp))
		.limit(20);
		
		// Получаем имена и уровни противников
		const battlesWithDetails = await Promise.all(battles.map(async (battle) => {
			const opponentId = battle.hero1Id === hero.id ? battle.hero2Id : battle.hero1Id;
			const opponent = await db.query.heroes.findFirst({
				where: eq(heroes.id, opponentId)
			});
			
			return {
				...battle,
				opponentName: opponent?.name || 'Неизвестный',
				opponentLevel: opponent?.level || 1
			};
		}));
		
		return {
			hero,
			battles: battlesWithDetails
		};
	} catch (error) {
		console.error('Failed to load arena battles:', error);
		return {
			hero,
			battles: []
		};
	}
};

