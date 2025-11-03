import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { activateHeroEvents } from '$lib/server/eventQueue';

export const POST: RequestHandler = async ({ params }) => {
	try {
		const heroId = parseInt(params.heroId);
		
		await activateHeroEvents(heroId);
		
		return json({ success: true });
	} catch (error) {
		console.error('Error activating hero:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

