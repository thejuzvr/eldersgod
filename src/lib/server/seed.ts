import { db } from './db/index.js';
import { items, heroes, users } from './db/schema.js';
import { items as gameItems } from '$lib/game/data/items.js';
import { hashPassword } from './auth.js';
import { getRandomTitle } from '$lib/game/data/titles.js';

/**
 * Seed начальных данных
 */
export async function seedDatabase() {
	console.log('🌱 Starting database seeding...');
	
	try {
		// 1. Добавляем все предметы в БД
		console.log('📦 Seeding items...');
		for (const item of gameItems) {
			await db.insert(items).values({
				name: item.name,
				type: item.type,
				rarity: item.rarity,
				stats: item.stats,
				description: item.description,
				icon: item.icon
			}).onConflictDoNothing();
		}
		console.log(`✅ Seeded ${gameItems.length} items`);
		
		// 2. Создаём NPC-героев для арены
		console.log('🤖 Creating NPC heroes...');
		
		const npcData = [
			{ name: 'Вориан Сырный', race: 'Nord', level: 5, title: 'Лорд Сырный Ус' },
			{ name: 'Азура Облачная', race: 'High Elf', level: 7, title: 'Шёпот Ветра' },
			{ name: 'Грогнак Кекс', race: 'Orc', level: 3, title: 'Покоритель Кексов' },
			{ name: 'Тенедрил Носок', race: 'Dark Elf', level: 10, title: 'Мастер Носочной Магии' },
			{ name: 'Лумина Гриб', race: 'Wood Elf', level: 6, title: 'Главный Гриб Королевства' },
			{ name: 'Железный Батон', race: 'Imperial', level: 8, title: 'Барон Медового Крика' },
			{ name: 'Сладкий Рулет', race: 'Breton', level: 4, title: 'Пекарь Драконьих Кексов' },
			{ name: 'Облачный Художник', race: 'Argonian', level: 12, title: 'Академик Облачной Живописи' }
		];
		
		// Создаём системного пользователя для NPC
		const [npcUser] = await db.insert(users).values({
			email: 'npc@eldersgod.game',
			passwordHash: await hashPassword('npc_password_system'),
		}).onConflictDoNothing().returning();
		
		const userId = npcUser?.id || 1;
		
		for (const npc of npcData) {
			const exp = Math.floor(100 * Math.pow(1.5, npc.level - 1));
			
			await db.insert(heroes).values({
				userId: userId,
				name: npc.name,
				race: npc.race,
				level: npc.level,
				experience: exp,
				gold: Math.floor(Math.random() * 500) + 100,
				dragonSouls: Math.floor(Math.random() * 5),
				currentHealth: 100 + (npc.level * 20),
				maxHealth: 100 + (npc.level * 20),
				strength: 10 + npc.level * 2,
				intelligence: 10 + npc.level * 2,
				luck: 10 + npc.level,
				title: npc.title,
				isActive: false // NPC не активны в событиях
			}).onConflictDoNothing();
		}
		
		console.log(`✅ Created ${npcData.length} NPC heroes`);
		
		console.log('🎉 Database seeding completed!');
		
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	}
}

// Если запускается напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
	seedDatabase()
		.then(() => {
			console.log('Seed completed successfully');
			process.exit(0);
		})
		.catch((error) => {
			console.error('Seed failed:', error);
			process.exit(1);
		});
}

