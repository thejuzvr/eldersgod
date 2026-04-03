import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { heroes, eventsLog } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { invalidateHeroCache } from '$lib/server/redis';

export const POST: RequestHandler = async ({ params, request, locals }) => {
	if (!locals.user || !locals.hero) {
		return json({ success: false, error: 'Unauthorized' }, { status: 401 });
	}

	const heroId = parseInt(params.heroId);
	
	if (locals.hero.id !== heroId) {
		return json({ success: false, error: 'Forbidden' }, { status: 403 });
	}

	const { action, prayerCost } = await request.json();

	try {
		const hero = await db.query.heroes.findFirst({
			where: eq(heroes.id, heroId)
		});

		if (!hero) {
			return json({ success: false, error: 'Hero not found' }, { status: 404 });
		}

		let updates: any = {};
		let eventContent: any = {};

		if (action === 'bless') {
			// Благословение
			updates.currentHealth = Math.min(hero.maxHealth, hero.currentHealth + 20);
			updates.experience = hero.experience + 50;
			updates.gold = hero.gold + 25;
			
			eventContent = {
				type: 'divine',
				category: 'reward',
				title: '✨ Божественное благословение',
				description: `Боги благословили ${hero.name}! Силы небес наполняют героя энергией и удачей.`,
				thought: 'О! Я чувствую божественную силу! Может, это просто несварение?',
				rewards: { exp: 50, gold: 25, health: 20 },
				icon: '✨'
			};
		} else if (action === 'punish') {
			// Наказание
			updates.currentHealth = Math.max(1, hero.currentHealth - 15);
			updates.experience = hero.experience + 30; // Через боль приходит опыт
			
			eventContent = {
				type: 'divine',
				category: 'danger',
				title: '⚡ Божественное наказание',
				description: `Боги недовольны ${hero.name}! Небесная кара обрушилась на героя, но это лишь укрепило его дух.`,
				thought: 'Ой! Что я сделал не так?! Может, не надо было есть тот священный сыр...',
				rewards: { exp: 30 },
				healthChange: -15,
				icon: '⚡'
			};
		}

		// Обновляем героя
		await db.update(heroes)
			.set(updates)
			.where(eq(heroes.id, heroId));

		// Записываем событие в лог
		await db.insert(eventsLog).values({
			heroId: heroId,
			eventType: 'divine',
			content: eventContent
		});

		await invalidateHeroCache(heroId);

		const { publishEventToHero } = await import('$lib/server/redis');
		await publishEventToHero(heroId, {
			type: 'divine_intervention',
			intervention: {
				type: action,
				message: action === 'bless' ? 'Боги благословили вас!' : 'Небесная кара настигла вас!'
			}
		});

		return json({ 
			success: true, 
			hero: { ...hero, ...updates },
			event: eventContent
		});
	} catch (error) {
		console.error('Divine action error:', error);
		return json({ success: false, error: 'Server error' }, { status: 500 });
	}
};

