import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ locals }) => {
	// Проверяем авторизацию
	if (!locals.user || !locals.hero) {
		throw redirect(303, '/auth/login');
	}
	
	return {
		hero: locals.hero
	};
};

