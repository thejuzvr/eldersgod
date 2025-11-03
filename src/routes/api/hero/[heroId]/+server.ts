import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { heroes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params }) => {
	try {
		const heroId = parseInt(params.heroId);
		
		const hero = await db.query.heroes.findFirst({
			where: eq(heroes.id, heroId),
			with: {
				inventory: {
					with: {
						item: true
					}
				}
			}
		});
		
		if (!hero) {
			return json({ success: false, error: 'Hero not found' }, { status: 404 });
		}
		
		return json({ success: true, hero });
	} catch (error) {
		console.error('Error fetching hero:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

