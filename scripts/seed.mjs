import postgres from 'postgres';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Подключение к БД (используем напрямую postgres, не drizzle)
const sql = postgres(process.env.DATABASE_URL);

// Игровые предметы
const gameItems = [
	{ name: 'Носок-телепорт', type: 'weapon', rarity: 'absurd', stats: { strength: 5, luck: 10 }, description: 'Единственный носок из пары. Телепортирует врагов... в прошлое! Иногда.', icon: '🧦' },
	{ name: 'Меч из замороженного крика', type: 'weapon', rarity: 'legendary', stats: { strength: 15, intelligence: 5 }, description: 'Фус-Ро-Да превратилось в лёд. Теперь это меч. Логика!', icon: '⚔️' },
	{ name: 'Ложка судьбы', type: 'weapon', rarity: 'epic', stats: { luck: 20 }, description: 'Обычная ложка, но она знает будущее. Не делится.', icon: '🥄' },
	{ name: 'Медовый шлем', type: 'armor', rarity: 'rare', stats: { health: 20, luck: 5 }, description: 'Пчёлы одобряют. Осы — нет. Липкий.', icon: '🍯' },
	{ name: 'Щит полуночной сырности', type: 'armor', rarity: 'legendary', stats: { health: 30, intelligence: 5 }, description: 'Сделан из лунного сыра. Драконы путают с едой.', icon: '🛡️' },
	{ name: 'Сапоги вечного танца', type: 'armor', rarity: 'epic', stats: { luck: 15, strength: 5 }, description: 'Нельзя перестать танцевать. Вообще. Помогите.', icon: '👢' },
	{ name: 'Кольцо говорящих облаков', type: 'artifact', rarity: 'legendary', stats: { intelligence: 10, luck: 10 }, description: 'Облака дают советы. Бесполезные, но искренние.', icon: '💍' },
	{ name: 'Сахарная бомба', type: 'artifact', rarity: 'epic', stats: { strength: 20 }, description: 'Взрывается конфетти и диабетом.', icon: '🍬' },
	{ name: 'Золотой зуб удачи', type: 'artifact', rarity: 'legendary', stats: { luck: 30 }, description: 'Подарок от извинившейся лестницы.', icon: '🦷' },
	{ name: 'Джемная душа', type: 'artifact', rarity: 'epic', stats: { health: 20, intelligence: 10 }, description: 'Душа кекса-дракона. Сладкая. Липкая.', icon: '💎' }
];

// NPC данные
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

async function seed() {
	console.log('🌱 Starting database seeding...');
	
	try {
		// 1. Добавляем предметы
		console.log('📦 Seeding items...');
		for (const item of gameItems) {
			await sql`
				INSERT INTO items (name, type, rarity, stats, description, icon)
				VALUES (${item.name}, ${item.type}, ${item.rarity}, ${JSON.stringify(item.stats)}, ${item.description}, ${item.icon})
				ON CONFLICT DO NOTHING
			`;
		}
		console.log(`✅ Seeded ${gameItems.length} items`);
		
		// 2. Создаём NPC пользователя
		console.log('🤖 Creating NPC heroes...');
		const passwordHash = await bcrypt.hash('npc_password_system', 10);
		
		const userResult = await sql`
			INSERT INTO users (email, password_hash, created_at)
			VALUES (${'npc@eldersgod.game'}, ${passwordHash}, NOW())
			ON CONFLICT (email) DO UPDATE SET email = EXCLUDED.email
			RETURNING id
		`;
		
		const userId = userResult[0]?.id || 1;
		
		// 3. Создаём NPC героев
		for (const npc of npcData) {
			const exp = Math.floor(100 * Math.pow(1.5, npc.level - 1));
			const health = 100 + (npc.level * 20);
			const gold = Math.floor(Math.random() * 500) + 100;
			const dragonSouls = Math.floor(Math.random() * 5);
			const strength = 10 + npc.level * 2;
			const intelligence = 10 + npc.level * 2;
			const luck = 10 + npc.level;
			
			await sql`
				INSERT INTO heroes (
					user_id, name, race, level, experience, gold, dragon_souls,
					current_health, max_health, strength, intelligence, luck, title, is_active, created_at
				)
				VALUES (
					${userId}, ${npc.name}, ${npc.race}, ${npc.level}, ${exp}, ${gold}, ${dragonSouls},
					${health}, ${health}, ${strength}, ${intelligence}, ${luck}, ${npc.title}, ${false}, NOW()
				)
				ON CONFLICT DO NOTHING
			`;
		}
		
		console.log(`✅ Created ${npcData.length} NPC heroes`);
		console.log('🎉 Database seeding completed!');
		
	} catch (error) {
		console.error('❌ Error seeding database:', error);
		throw error;
	} finally {
		await sql.end();
	}
}

seed()
	.then(() => {
		console.log('Seed completed successfully');
		process.exit(0);
	})
	.catch((error) => {
		console.error('Seed failed:', error);
		process.exit(1);
	});

