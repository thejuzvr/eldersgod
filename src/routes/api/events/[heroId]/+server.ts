import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { eventsLog } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';

export const GET: RequestHandler = async ({ params, url }) => {
	try {
		const heroId = parseInt(params.heroId);
		const limit = parseInt(url.searchParams.get('limit') || '50');
		
		const events = await db.query.eventsLog.findMany({
			where: eq(eventsLog.heroId, heroId),
			orderBy: [desc(eventsLog.timestamp)],
			limit: limit
		});
		
		// Преобразуем JSON content в объекты
		const formattedEvents = events.reverse().map(event => ({
			...event,
			...(typeof event.content === 'object' ? event.content : {})
		}));
		
		return json({ success: true, events: formattedEvents });
	} catch (error) {
		console.error('Error fetching events:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

