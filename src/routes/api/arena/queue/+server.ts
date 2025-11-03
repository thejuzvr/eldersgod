import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { addHeroToArenaQueue, findArenaOpponent } from '$lib/server/redis';
import { conductBattle } from '$lib/game/arena';
import { db } from '$lib/server/db';
import { heroes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const { heroId } = await request.json();
		
		if (!heroId) {
			return json({ success: false, error: 'Missing heroId' }, { status: 400 });
		}
		
		// Получаем данные героя
		const hero = await db.query.heroes.findFirst({
			where: eq(heroes.id, heroId)
		});
		
		if (!hero) {
			return json({ success: false, error: 'Hero not found' }, { status: 404 });
		}
		
		// Ищем противника
		const opponentId = await findArenaOpponent(heroId, hero.level);
		
		if (opponentId) {
			// Нашли противника! Проводим бой
			const battle = await conductBattle(heroId, opponentId);
			
			return json({ 
				success: true, 
				battleFound: true,
				battle 
			});
		} else {
			// Противника нет, добавляем в очередь
			await addHeroToArenaQueue(heroId, hero.level);
			
			return json({ 
				success: true, 
				battleFound: false,
				message: 'Added to queue' 
			});
		}
	} catch (error: any) {
		console.error('Error in arena queue:', error);
		return json({ success: false, error: error.message }, { status: 500 });
	}
};

