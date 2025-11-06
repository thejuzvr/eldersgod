#!/usr/bin/env node

/**
 * Скрипт миграции игрового контента в новую систему управления
 * Использует прямое подключение к PostgreSQL
 */

import postgres from 'postgres';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load .env
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Подключение к БД
const sql = postgres(process.env.DATABASE_URL);

// ========== ДАННЫЕ ДЛЯ МИГРАЦИИ (встроенные) ==========

const titlesData = [
	'Лорд Сырный Ус', 'Барон Медового Крика', 'Герцог Облачных Носков',
	'Покоритель Кексов', 'Укротитель Лестниц', 'Друг Драконов-Пчеловодов',
	'Главный Философ Лошадей', 'Переводчик с Облачного',
	'Шёпот Ветра (иногда)', 'Предсказатель Завтраков',
	'Повар Судьбы', 'Пекарь Драконьих Кексов',
	'Тот, Кто Упал в Колодец', 'Нашедший Второй Носок',
	'Почти Герой', 'Вечный Неудачник (с стилем)',
	'Король Носочного Королевства', 'Царь Абсурда',
	'Профессор Несуществующих Наук', 'Просто Хороший Человек'
];

const thoughtsData = [
	{ text: 'О, Великий! Это была странная неделя...', category: 'general' },
	{ text: 'Этот дракон выглядит голодным. Я тоже голоден.', category: 'combat' },
	{ text: 'Сокровище! Наконец-то! Это... носок?', category: 'discovery' },
	{ text: 'Мой новый друг - гриб. Он не говорит, но слушает.', category: 'friendship' },
	{ text: 'Я стал грибом? Нет, это просто шляпа.', category: 'absurd' },
	{ text: 'Магия - это наука? Или наука - это магия?', category: 'magic' },
	{ text: 'Голоден. Очень голоден. Сыр - это решение.', category: 'food' },
	{ text: 'Скучно... Нарисую облако!', category: 'idle' }
];

const itemsData = [
	{ name: 'Носок-телепорт', type: 'weapon', rarity: 'absurd', stats: { strength: 5, luck: 10 }, description: 'Телепортирует врагов в прошлое', icon: '🧦' },
	{ name: 'Меч из замороженного крика', type: 'weapon', rarity: 'legendary', stats: { strength: 15, intelligence: 5 }, description: 'Фус-Ро-Да превратилось в лёд', icon: '⚔️' },
	{ name: 'Медовый шлем', type: 'armor', rarity: 'rare', stats: { health: 20, luck: 5 }, description: 'Пчёлы одобряют', icon: '🍯' },
	{ name: 'Кольцо говорящих облаков', type: 'artifact', rarity: 'legendary', stats: { intelligence: 10, luck: 10 }, description: 'Облака дают советы', icon: '💍' }
];

const locationsData = [
	{ name: 'Вайтран', description: 'Город, где все драконы на диете', region: 'Skyrim' },
	{ name: 'Рифтен', description: 'Город воров, которые крадут только носки', region: 'Skyrim' },
	{ name: 'Колодец с драконом', description: 'Обычный колодец, но там дракон-пчеловод', region: 'Unknown' },
	{ name: 'Пещера говорящих камней', description: 'Камни дают советы. Плохие.', region: 'Unknown' }
];

const creaturesData = [
	{ name: 'Дракон-пчеловод', icon: '🐉', hostile: false, absurdity: 'высокая' },
	{ name: 'Кекс-дракон', icon: '🐲', hostile: true, absurdity: 'максимальная' },
	{ name: 'Гриб-воин', icon: '🍄', hostile: true, absurdity: 'высокая' },
	{ name: 'Лошадь-философ', icon: '🐴', hostile: false, absurdity: 'высокая' }
];

const actionsData = [
	{ text: 'сразился с', category: 'combat' },
	{ text: 'победил', category: 'combat' },
	{ text: 'поговорил с', category: 'social' },
	{ text: 'подружился с', category: 'social' },
	{ text: 'превратился в', category: 'absurd' },
	{ text: 'станцевал танго с', category: 'absurd' }
];

// ========== ФУНКЦИИ КОНВЕРТАЦИИ ==========

function getRarityColor(rarity) {
	const colors = {
		'common': '#9CA3AF',
		'uncommon': '#10B981',
		'rare': '#3B82F6',
		'epic': '#8B5CF6',
		'legendary': '#F59E0B',
		'absurd': '#EC4899'
	};
	return colors[rarity] || '#9CA3AF';
}

function getRarityWeight(rarity) {
	const weights = {
		'common': 1, 'uncommon': 3, 'rare': 5,
		'epic': 8, 'legendary': 10, 'absurd': 12
	};
	return weights[rarity] || 1;
}

// ========== МИГРАЦИЯ ==========

async function runMigration() {
	console.log('🚀 Начинаю миграцию контента...\n');
	
	try {
		// Очищаем существующий контент
		console.log('🗑️ Очищаю существующий контент...');
		try {
			await sql`TRUNCATE TABLE content_analytics CASCADE`;
			await sql`TRUNCATE TABLE game_content CASCADE`;
			console.log('✅ Очистка завершена\n');
		} catch (error) {
			console.warn('⚠️ Таблицы еще не созданы, пропускаю очистку\n');
		}
		
		let totalInserted = 0;
		
		// 1. Вставляем титулы
		console.log('👑 Вставляю титулы...');
		for (const title of titlesData) {
			let category = 'general';
			let weight = 1;
			
			if (title.includes('Лорд') || title.includes('Барон')) {
				category = 'noble';
				weight = 8;
			} else if (title.includes('Покоритель')) {
				category = 'heroic';
				weight = 7;
			} else if (title.includes('Король') || title.includes('Царь')) {
				category = 'royal';
				weight = 10;
			}
			
			await sql`
				INSERT INTO game_content (
					type, name, category, weight, icon, tags, is_active, unlock_level,
					color, data, metadata, created_at, updated_at
				)
				VALUES (
					${'title'}, ${title}, ${category}, ${weight}, ${'👑'},
					${['title', category]}, ${true}, ${1}, ${'#D4AF37'},
					${JSON.stringify({ description: `${title} - великий титул`, prestige: weight })},
					${JSON.stringify({})}, NOW(), NOW()
				)
			`;
			totalInserted++;
		}
		console.log(`✅ Вставлено ${titlesData.length} титулов\n`);
		
		// 2. Вставляем мысли
		console.log('💭 Вставляю мысли...');
		for (const thought of thoughtsData) {
			let weight = thought.text.length > 100 ? 3 : 1;
			if (thought.text.includes('О, Великий')) weight += 2;
			
			await sql`
				INSERT INTO game_content (
					type, text, category, weight, icon, tags, is_active, unlock_level,
					color, data, metadata, created_at, updated_at
				)
				VALUES (
					${'thought'}, ${thought.text}, ${thought.category}, ${weight}, ${'💭'},
					${['thought', thought.category]}, ${true}, ${1}, ${'#6B7280'},
					${JSON.stringify({ mood: 'neutral', context: thought.category })},
					${JSON.stringify({})}, NOW(), NOW()
				)
			`;
			totalInserted++;
		}
		console.log(`✅ Вставлено ${thoughtsData.length} мыслей\n`);
		
		// 3. Вставляем предметы
		console.log('⚔️ Вставляю предметы...');
		for (const item of itemsData) {
			const weight = getRarityWeight(item.rarity);
			
			await sql`
				INSERT INTO game_content (
					type, name, category, rarity, weight, icon, tags, is_active, unlock_level,
					color, data, metadata, created_at, updated_at
				)
				VALUES (
					${'item'}, ${item.name}, ${item.type}, ${item.rarity}, ${weight}, ${item.icon},
					${['item', item.type, item.rarity]}, ${true}, ${1}, ${getRarityColor(item.rarity)},
					${JSON.stringify({ type: item.type, description: item.description, stats: item.stats, price: weight * 10 })},
					${JSON.stringify({})}, NOW(), NOW()
				)
			`;
			totalInserted++;
		}
		console.log(`✅ Вставлено ${itemsData.length} предметов\n`);
		
		// 4. Вставляем локации
		console.log('🌍 Вставляю локации...');
		for (const location of locationsData) {
			const category = location.description.includes('город') ? 'city' : 'special';
			
			await sql`
				INSERT INTO game_content (
					type, name, text, category, weight, icon, tags, is_active, unlock_level,
					color, data, metadata, created_at, updated_at
				)
				VALUES (
					${'location'}, ${location.name}, ${location.description}, ${category}, ${3}, ${'🌍'},
					${['location', location.region.toLowerCase()]}, ${true}, ${1}, ${'#10B981'},
					${JSON.stringify({ description: location.description, region: location.region, environment: 'plains' })},
					${JSON.stringify({})}, NOW(), NOW()
				)
			`;
			totalInserted++;
		}
		console.log(`✅ Вставлено ${locationsData.length} локаций\n`);
		
		// 5. Вставляем существ
		console.log('🐉 Вставляю существ...');
		for (const creature of creaturesData) {
			const rarityMap = { 'средняя': 'common', 'высокая': 'rare', 'максимальная': 'epic' };
			const rarity = rarityMap[creature.absurdity] || 'common';
			const weight = getRarityWeight(rarity);
			const category = creature.name.includes('дракон') ? 'dragon' : 'monster';
			
			await sql`
				INSERT INTO game_content (
					type, name, category, rarity, weight, icon, tags, is_active, unlock_level,
					color, data, metadata, created_at, updated_at
				)
				VALUES (
					${'creature'}, ${creature.name}, ${category}, ${rarity}, ${weight}, ${creature.icon},
					${['creature', category]}, ${true}, ${1}, ${getRarityColor(rarity)},
					${JSON.stringify({ description: `Существо: ${creature.name}`, behavior: creature.hostile ? 'aggressive' : 'peaceful', health: 50 + weight * 10 })},
					${JSON.stringify({})}, NOW(), NOW()
				)
			`;
			totalInserted++;
		}
		console.log(`✅ Вставлено ${creaturesData.length} существ\n`);
		
		// 6. Вставляем действия
		console.log('🎭 Вставляю действия...');
		for (const action of actionsData) {
			const weightMap = { 'combat': 3, 'social': 2, 'absurd': 5 };
			const weight = weightMap[action.category] || 2;
			
			await sql`
				INSERT INTO game_content (
					type, text, category, weight, icon, tags, is_active, unlock_level,
					color, data, metadata, created_at, updated_at
				)
				VALUES (
					${'action'}, ${action.text}, ${action.category}, ${weight}, ${'🎭'},
					${['action', action.category]}, ${true}, ${1}, ${'#6B7280'},
					${JSON.stringify({ context: action.category, successRate: 0.7 })},
					${JSON.stringify({})}, NOW(), NOW()
				)
			`;
			totalInserted++;
		}
		console.log(`✅ Вставлено ${actionsData.length} действий\n`);
		
		// Создаем аналитические записи
		console.log('📊 Создаю аналитические записи...');
		const contentIds = await sql`SELECT id FROM game_content`;
		
		for (const { id } of contentIds) {
			await sql`
				INSERT INTO content_analytics (
					content_id, used_count, user_ratings, average_rating,
					total_revenue, views, shares, created_at, updated_at
				)
				VALUES (
					${id}, ${0}, ${JSON.stringify({})}, ${'0.00'},
					${0}, ${0}, ${0}, NOW(), NOW()
				)
			`;
		}
		
		console.log(`✅ Создано ${contentIds.length} аналитических записей\n`);
		console.log(`🎉 Миграция завершена успешно!`);
		console.log(`📈 Всего вставлено: ${totalInserted} элементов контента`);
		
	} catch (error) {
		console.error('❌ Ошибка миграции:', error);
		throw error;
	} finally {
		await sql.end();
	}
}

// Запуск
runMigration()
	.then(() => {
		console.log('\n🎊 Готово!');
		process.exit(0);
	})
	.catch((error) => {
		console.error('\n💥 Ошибка:', error);
		process.exit(1);
	});