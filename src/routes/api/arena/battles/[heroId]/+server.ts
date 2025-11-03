import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { arenaBattles } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const heroId = parseInt(params.heroId);
		
		const battles = await db.query.arenaBattles.findMany({
			where: or(
				eq(arenaBattles.hero1Id, heroId),
				eq(arenaBattles.hero2Id, heroId)
			),
			with: {
				hero1: true,
				hero2: true,
				winner: true
			},
			orderBy: [desc(arenaBattles.timestamp)],
			limit: 20
		});
		
		return json({ success: true, battles });
	} catch (error) {
		console.error('Error fetching battles:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

