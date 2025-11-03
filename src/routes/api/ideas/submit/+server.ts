import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userIdeas } from '$lib/server/db/schema';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.hero) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const { heroId, category, subject, content } = await request.json();

	try {
		// Сохраняем идею в БД
		await db.insert(userIdeas).values({
			heroId,
			category,
			subject,
			content,
			status: 'pending'
		});

		return json({ success: true, message: 'Идея принята!' });
	} catch (error) {
		console.error('Error submitting idea:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

