import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { unequipItem } from '$lib/game/progression';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.hero) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const itemId = parseInt(params.itemId);
	const { heroId } = await request.json();
	
	if (locals.hero.id !== heroId) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	try {
		await unequipItem(heroId, itemId);
		return json({ success: true });
	} catch (error) {
		console.error('Error unequipping item:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

