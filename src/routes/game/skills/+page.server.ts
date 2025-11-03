import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { heroSkills } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Проверяем авторизацию
	if (!locals.user || !locals.hero) {
		throw redirect(303, '/auth/login');
	}
	
	// Загружаем умения героя
	const skills = await db.select()
		.from(heroSkills)
		.where(eq(heroSkills.heroId, locals.hero.id))
		.orderBy(heroSkills.acquiredAt);
	
	return {
		hero: locals.hero,
		skills
	};
};

