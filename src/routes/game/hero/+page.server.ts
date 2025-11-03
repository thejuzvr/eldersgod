import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { heroInventory, heroSkills } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Проверяем авторизацию
	if (!locals.user || !locals.hero) {
		throw redirect(303, '/auth/login');
	}
	
	// Загружаем инвентарь
	const inventory = await db.query.heroInventory.findMany({
		where: eq(heroInventory.heroId, locals.hero.id),
		with: {
			item: true
		},
		orderBy: (heroInventory, { desc }) => [desc(heroInventory.equipped)]
	});
	
	// Загружаем умения
	const skills = await db.select()
		.from(heroSkills)
		.where(eq(heroSkills.heroId, locals.hero.id))
		.orderBy(heroSkills.level);
	
	return {
		hero: locals.hero,
		inventory,
		skills
	};
};

