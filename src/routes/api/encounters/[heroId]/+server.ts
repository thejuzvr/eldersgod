import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { heroEncounters } from '$lib/server/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const heroId = parseInt(params.heroId);
		
		const encounters = await db.query.heroEncounters.findMany({
			where: or(
				eq(heroEncounters.hero1Id, heroId),
				eq(heroEncounters.hero2Id, heroId)
			),
			with: {
				hero1: true,
				hero2: true
			},
			orderBy: [desc(heroEncounters.timestamp)],
			limit: 30
		});
		
		return json({ success: true, encounters });
	} catch (error) {
		console.error('Error fetching encounters:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

