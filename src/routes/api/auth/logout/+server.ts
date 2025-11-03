import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
	// Удаляем cookie с токеном
	cookies.delete('auth_token', { path: '/' });
	
	return json({
		success: true
	});
};

