import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { heroSkills } from '$lib/server/db/schema';
import { getRandomSkill } from '$lib/game/data/skills';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user || !locals.hero) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const { heroId } = await request.json();
	
	if (locals.hero.id !== heroId) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	try {
		// Получаем случайное умение
		const skill = getRandomSkill();
		
		// Проверяем, есть ли уже такое умение
		const existingSkill = await db.query.heroSkills.findFirst({
			where: (heroSkills, { eq, and }) => 
				and(
					eq(heroSkills.heroId, heroId),
					eq(heroSkills.name, skill.name)
				)
		});
		
		if (existingSkill) {
			// Повышаем уровень умения
			await db.update(heroSkills)
				.set({ level: existingSkill.level + 1 })
				.where(eq(heroSkills.id, existingSkill.id));
			
			return json({ 
				success: true, 
				skill: { ...existingSkill, level: existingSkill.level + 1 },
				isNew: false
			});
		} else {
			// Добавляем новое умение
			const [newSkill] = await db.insert(heroSkills).values({
				heroId,
				name: skill.name,
				description: skill.description,
				icon: skill.icon,
				category: skill.category,
				level: 1
			}).returning();
			
			return json({ 
				success: true, 
				skill: newSkill,
				isNew: true
			});
		}
	} catch (error) {
		console.error('Error granting skill:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

