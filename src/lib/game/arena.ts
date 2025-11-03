import { db } from '$lib/server/db';
import { heroes, arenaBattles } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { getRandomAction } from './data/actions';
import { getRandomItem } from './data/items';

/**
 * Провести бой между двумя героями
 */
export async function conductBattle(hero1Id: number, hero2Id: number) {
	// Получаем данные героев
	const hero1 = await db.query.heroes.findFirst({
		where: eq(heroes.id, hero1Id)
	});
	
	const hero2 = await db.query.heroes.findFirst({
		where: eq(heroes.id, hero2Id)
	});
	
	if (!hero1 || !hero2) {
		throw new Error('Heroes not found');
	}
	
	// Генерируем абсурдный battle log
	const battleLog = generateBattleLog(hero1, hero2);
	
	// Определяем победителя (с учётом характеристик + удача)
	const winner = determineWinner(hero1, hero2);
	
	// Награды
	const rewards = {
		winner: {
			exp: 200 + Math.floor(Math.random() * 100),
			gold: 100 + Math.floor(Math.random() * 50),
			dragonSouls: Math.random() > 0.7 ? 1 : 0
		},
		loser: {
			exp: 50 + Math.floor(Math.random() * 30),
			gold: -50 - Math.floor(Math.random() * 30)
		}
	};
	
	// Сохраняем битву
	const [battle] = await db.insert(arenaBattles).values({
		hero1Id: hero1.id,
		hero2Id: hero2.id,
		winnerId: winner.id,
		battleLog: battleLog,
		rewards: rewards
	}).returning();
	
	// Применяем награды
	await applyBattleRewards(winner.id, rewards.winner);
	await applyBattleRewards(winner.id === hero1.id ? hero2.id : hero1.id, rewards.loser);
	
	return battle;
}

/**
 * Генерировать абсурдный лог битвы
 */
function generateBattleLog(hero1: any, hero2: any) {
	const log: string[] = [];
	
	log.push(`🎺 Начинается эпическая битва между ${hero1.name} и ${hero2.name}!`);
	log.push('');
	
	// Раунд 1
	const action1 = getRandomAction('combat');
	const creature = ['носком-телепортом', 'сковородой правосудия', 'ложкой судьбы', 'метлой разрушения'][Math.floor(Math.random() * 4)];
	log.push(`⚔️ Раунд 1:`);
	log.push(`${hero1.name} ${action1} ${hero2.name} с помощью ${creature}!`);
	
	if (Math.random() > 0.5) {
		log.push(`Но промахнулся... и попал в облако.`);
	} else {
		log.push(`Удар был настолько мощным, что ${hero2.name} превратился в сыр! На секунду.`);
	}
	log.push('');
	
	// Раунд 2
	log.push(`⚔️ Раунд 2:`);
	const absurdEvent = [
		`${hero2.name} использовал крик "Фус-Ро-Да", но получился "Фу-Ра-Лё"!`,
		`${hero2.name} призвал дракона... игрушечного.`,
		`${hero2.name} попытался телепортироваться, но переместился на метр влево.`,
		`${hero2.name} замахнулся мечом... который оказался батоном.`
	][Math.floor(Math.random() * 4)];
	log.push(absurdEvent);
	log.push('');
	
	// Раунд 3
	log.push(`⚔️ Раунд 3:`);
	log.push(`Оба героя устали и начали философскую дискуссию о смысле битв.`);
	log.push(`Гриб-судья вмешался и объявил победителя!`);
	log.push('');
	
	// Результат (будет добавлен позже)
	const winner = determineWinner(hero1, hero2);
	
	if (winner.id === hero1.id) {
		log.push(`🏆 Победитель: ${hero1.name}!`);
		log.push(`${hero2.name} проиграл, но получил утешительный сыр.`);
	} else {
		log.push(`🏆 Победитель: ${hero2.name}!`);
		log.push(`${hero1.name} проиграл, но сохранил достоинство (и носок).`);
	}
	
	log.push('');
	log.push(`💬 Комментарий облака: "Битва была... интересной."`);
	
	return log;
}

/**
 * Определить победителя
 */
function determineWinner(hero1: any, hero2: any) {
	// Вычисляем силу с учётом случайности
	const power1 = hero1.strength + hero1.intelligence + hero1.luck + Math.random() * 50;
	const power2 = hero2.strength + hero2.intelligence + hero2.luck + Math.random() * 50;
	
	return power1 > power2 ? hero1 : hero2;
}

/**
 * Применить награды за битву
 */
async function applyBattleRewards(heroId: number, rewards: any) {
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId)
	});
	
	if (!hero) return;
	
	const updates: any = {};
	
	if (rewards.exp) {
		updates.experience = hero.experience + rewards.exp;
	}
	
	if (rewards.gold) {
		updates.gold = Math.max(0, hero.gold + rewards.gold);
	}
	
	if (rewards.dragonSouls) {
		updates.dragonSouls = hero.dragonSouls + rewards.dragonSouls;
	}
	
	if (Object.keys(updates).length > 0) {
		await db.update(heroes)
			.set(updates)
			.where(eq(heroes.id, heroId));
	}
}

