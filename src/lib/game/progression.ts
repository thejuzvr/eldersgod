import { db } from '$lib/server/db';
import { heroes, heroInventory, items, heroSkills } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { getTitleByLevel } from './data/titles';
import { invalidateHeroCache } from '$lib/server/redis';

/**
 * Вычислить необходимый опыт для уровня (нелинейная прогрессия)
 */
export function getExpForLevel(level: number): number {
	return Math.floor(100 * Math.pow(1.5, level - 1));
}

/**
 * Вычислить уровень по опыту
 */
export function getLevelFromExp(exp: number): number {
	let level = 1;
	while (exp >= getExpForLevel(level + 1)) {
		level++;
	}
	return level;
}

/**
 * Применить награды из события (включая урон HP)
 */
export async function applyEventRewards(heroId: number, rewards: any, healthChange?: number) {
	// Получаем текущего героя
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId)
	});
	
	if (!hero) return;
	
	const updates: any = {};
	let leveledUp = false;
	let newLevel = hero.level;
	let heroDied = false;
	
	// Опыт
	if (rewards.exp) {
		const newExp = Math.max(0, hero.experience + rewards.exp);
		updates.experience = newExp;
		
		// Проверка повышения уровня
		const calculatedLevel = getLevelFromExp(newExp);
		if (calculatedLevel > hero.level) {
			leveledUp = true;
			newLevel = calculatedLevel;
			updates.level = newLevel;
			
			// Повышаем характеристики
			updates.maxHealth = hero.maxHealth + 20;
			updates.currentHealth = hero.maxHealth + 20; // полное восстановление при апе
			updates.strength = hero.strength + Math.floor(Math.random() * 3) + 2;
			updates.intelligence = hero.intelligence + Math.floor(Math.random() * 3) + 2;
			updates.luck = hero.luck + Math.floor(Math.random() * 3) + 1;
			
			// Возможно новый титул
			if (newLevel % 5 === 0) { // Каждые 5 уровней
				updates.title = getTitleByLevel(newLevel);
			}
		}
	}
	
	// Золото
	if (rewards.gold) {
		updates.gold = Math.max(0, hero.gold + rewards.gold);
	}
	
	// Души драконов
	if (rewards.dragonSouls) {
		updates.dragonSouls = hero.dragonSouls + rewards.dragonSouls;
	}
	
	// Здоровье из наград
	if (rewards.health) {
		const newHealth = Math.max(0, Math.min(hero.maxHealth, hero.currentHealth + rewards.health));
		updates.currentHealth = newHealth;
	}
	
	// Изменение HP от события (урон/лечение)
	if (healthChange !== undefined && healthChange !== 0) {
		let currentHP = updates.currentHealth !== undefined ? updates.currentHealth : hero.currentHealth;
		currentHP = Math.max(0, Math.min(hero.maxHealth, currentHP + healthChange));
		updates.currentHealth = currentHP;
		
		// Проверка на смерть
		if (currentHP <= 0) {
			heroDied = true;
			// Воскрешаем с 30% HP
			updates.currentHealth = Math.floor(hero.maxHealth * 0.3);
			// Штраф за смерть
			updates.gold = Math.max(0, (hero.gold || 0) - Math.floor((hero.gold || 0) * 0.1)); // -10% золота
		}
	}
	
	// Характеристики
	if (rewards.strength) {
		updates.strength = hero.strength + rewards.strength;
	}
	
	if (rewards.intelligence) {
		updates.intelligence = hero.intelligence + rewards.intelligence;
	}
	
	if (rewards.luck) {
		updates.luck = hero.luck + rewards.luck;
	}
	
	// Новый титул
	if (rewards.newTitle) {
		updates.title = rewards.newTitle;
	}
	
	// Новая локация (если событие содержит информацию о смене локации)
	if (rewards.newLocation) {
		updates.currentLocation = rewards.newLocation;
	}
	
	// Обновляем героя в БД
	if (Object.keys(updates).length > 0) {
		await db.update(heroes)
			.set(updates)
			.where(eq(heroes.id, heroId));
		
		// Инвалидируем кэш
		await invalidateHeroCache(heroId);
	}
	
	// Добавляем предмет в инвентарь
	if (rewards.item) {
		await addItemToInventory(heroId, rewards.item);
	}
	
	// Добавляем умение
	if (rewards.skill) {
		await addSkillToHero(heroId, rewards.skill);
	}

	return { leveledUp, newLevel, heroDied };
}

/**
 * Изучить новое умение
 */
async function addSkillToHero(heroId: number, skillData: any) {
	// Проверяем, есть ли уже это умение
	const existingSkill = await db.query.heroSkills.findFirst({
		where: and(
			eq(heroSkills.heroId, heroId),
			eq(heroSkills.name, skillData.name)
		)
	});

	if (existingSkill) {
		// Если умение уже есть, повышаем его уровень
		await db.update(heroSkills)
			.set({ level: existingSkill.level + 1 })
			.where(eq(heroSkills.id, existingSkill.id));
	} else {
		// Если нет - добавляем новое
		await db.insert(heroSkills).values({
			heroId,
			name: skillData.name,
			description: skillData.description,
			category: skillData.category || 'combat',
			icon: skillData.icon || '📚',
			level: 1
		});
	}

	// Пассивные бонусы от скиллов - повышаем характеристики
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId)
	});

	if (hero) {
		const updates: any = {};

		// Редкие умения дают больше бонусов
		const multiplier = skillData.rarity === 'легендарное' ? 3 : (skillData.rarity === 'редкое' ? 2 : 1);

		if (skillData.category === 'combat') {
			updates.strength = hero.strength + (1 * multiplier);
		} else if (skillData.category === 'magic') {
			updates.intelligence = hero.intelligence + (1 * multiplier);
		} else {
			updates.luck = hero.luck + (1 * multiplier);
		}

		await db.update(heroes)
			.set(updates)
			.where(eq(heroes.id, heroId));

		await invalidateHeroCache(heroId);
	}
}

/**
 * Добавить предмет в инвентарь героя (с автоматической экипировкой)
 */
async function addItemToInventory(heroId: number, itemData: any) {
	// Сначала ищем предмет в таблице items или создаём новый
	let itemId: number;
	let item: any;
	
	// Проверяем, существует ли такой предмет
	const existingItem = await db.query.items.findFirst({
		where: eq(items.name, itemData.name)
	});
	
	if (existingItem) {
		itemId = existingItem.id;
		item = existingItem;
	} else {
		// Создаём новый предмет
		const [newItem] = await db.insert(items).values({
			name: itemData.name,
			type: itemData.type || 'artifact',
			rarity: itemData.rarity || 'common',
			stats: itemData.stats || {},
			description: itemData.description || 'Загадочный предмет',
			icon: itemData.icon || '❓'
		}).returning();
		
		itemId = newItem.id;
		item = newItem;
	}
	
	// Автоматическая экипировка: получаем все экипированные предметы героя
	const currentEquippedList = await db.query.heroInventory.findMany({
		where: (heroInventory, { eq, and }) =>
			and(
				eq(heroInventory.heroId, heroId),
				eq(heroInventory.equipped, true)
			),
		with: {
			item: true
		}
	});
	
	// Ищем экипированный предмет того же типа, что и новый
	const currentEquippedOfSameType = currentEquippedList.find(inv => inv.item.type === item.type);

	// Решение героя: экипировать новый предмет если он лучше (по редкости и статам)
	let shouldEquip = false;
	
	if (!currentEquippedOfSameType) {
		// Нет экипированного предмета такого типа - одеваем
		shouldEquip = true;
	} else {
		// Есть предмет того же типа - сравниваем
		const rarityOrder = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd'];
		const newRarityIndex = rarityOrder.indexOf(item.rarity);
		const oldRarityIndex = rarityOrder.indexOf(currentEquippedOfSameType.item.rarity);
		
		if (newRarityIndex > oldRarityIndex) {
			// Новый предмет лучше (по редкости) - одеваем
			shouldEquip = true;
			// Снимаем старый
			await db.update(heroInventory)
				.set({ equipped: false })
				.where(eq(heroInventory.id, currentEquippedOfSameType.id));
		}
	}
	
	// Добавляем в инвентарь героя
	await db.insert(heroInventory).values({
		heroId: heroId,
		itemId: itemId,
		equipped: shouldEquip
	});
	
	// Если экипировали, применяем бонусы
	if (shouldEquip && item.stats) {
		const hero = await db.query.heroes.findFirst({
			where: eq(heroes.id, heroId)
		});
		
		if (hero) {
			const stats = item.stats as any;
			const updates: any = {};
			
			if (stats.strength) updates.strength = hero.strength + stats.strength;
			if (stats.intelligence) updates.intelligence = hero.intelligence + stats.intelligence;
			if (stats.luck) updates.luck = hero.luck + stats.luck;
			if (stats.health) updates.maxHealth = hero.maxHealth + stats.health;
			
			if (Object.keys(updates).length > 0) {
				await db.update(heroes)
					.set(updates)
					.where(eq(heroes.id, heroId));
			}
		}
	}
}

/**
 * Экипировать предмет
 */
export async function equipItem(heroId: number, inventoryItemId: number) {
	const inventoryItem = await db.query.heroInventory.findFirst({
		where: eq(heroInventory.id, inventoryItemId),
		with: {
			item: true
		}
	});
	
	if (!inventoryItem || inventoryItem.heroId !== heroId) {
		throw new Error('Item not found in inventory');
	}
	
	// Находим все предметы, чтобы снять предмет того же типа
	const heroItems = await db.query.heroInventory.findMany({
		where: eq(heroInventory.heroId, heroId),
		with: {
			item: true
		}
	});
	const sameTypeEquipped = heroItems.filter(inv => inv.item.type === inventoryItem.item.type && inv.equipped);
	for (const inv of sameTypeEquipped) {
		await unequipItem(heroId, inv.id);
	}
	
	// Экипируем выбранный
	await db.update(heroInventory)
		.set({ equipped: true })
		.where(eq(heroInventory.id, inventoryItemId));
	
	// Применяем бонусы предмета к герою
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId)
	});
	
	if (hero && inventoryItem.item.stats) {
		const stats = inventoryItem.item.stats as any;
		const updates: any = {};
		
		if (stats.strength) updates.strength = hero.strength + stats.strength;
		if (stats.intelligence) updates.intelligence = hero.intelligence + stats.intelligence;
		if (stats.luck) updates.luck = hero.luck + stats.luck;
		if (stats.health) updates.maxHealth = hero.maxHealth + stats.health;
		
		if (Object.keys(updates).length > 0) {
			await db.update(heroes)
				.set(updates)
				.where(eq(heroes.id, heroId));
			
			await invalidateHeroCache(heroId);
		}
	}
}

/**
 * Снять предмет
 */
export async function unequipItem(heroId: number, inventoryItemId: number) {
	const inventoryItem = await db.query.heroInventory.findFirst({
		where: eq(heroInventory.id, inventoryItemId),
		with: {
			item: true
		}
	});
	
	if (!inventoryItem || inventoryItem.heroId !== heroId) {
		throw new Error('Item not found in inventory');
	}
	
	// Снимаем предмет
	await db.update(heroInventory)
		.set({ equipped: false })
		.where(eq(heroInventory.id, inventoryItemId));
	
	// Убираем бонусы предмета
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId)
	});
	
	if (hero && inventoryItem.item.stats) {
		const stats = inventoryItem.item.stats as any;
		const updates: any = {};
		
		if (stats.strength) updates.strength = hero.strength - stats.strength;
		if (stats.intelligence) updates.intelligence = hero.intelligence - stats.intelligence;
		if (stats.luck) updates.luck = hero.luck - stats.luck;
		if (stats.health) updates.maxHealth = hero.maxHealth - stats.health;
		
		if (Object.keys(updates).length > 0) {
			await db.update(heroes)
				.set(updates)
				.where(eq(heroes.id, heroId));
			
			await invalidateHeroCache(heroId);
		}
	}
}

/**
 * Получить инвентарь героя
 */
export async function getHeroInventory(heroId: number) {
	return await db.query.heroInventory.findMany({
		where: eq(heroInventory.heroId, heroId),
		with: {
			item: true
		},
		orderBy: (heroInventory, { desc }) => [desc(heroInventory.acquiredAt)]
	});
}

/**
 * Вычислить суммарные характеристики героя с учётом экипировки
 */
export async function calculateHeroStats(heroId: number) {
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.id, heroId),
		with: {
			inventory: {
				where: eq(heroInventory.equipped, true),
				with: {
					item: true
				}
			}
		}
	});
	
	if (!hero) return null;
	
	let totalStrength = hero.strength;
	let totalIntelligence = hero.intelligence;
	let totalLuck = hero.luck;
	let totalHealth = hero.maxHealth;
	
	// Добавляем бонусы от экипированных предметов
	for (const invItem of hero.inventory) {
		const stats = invItem.item.stats as any;
		if (stats) {
			if (stats.strength) totalStrength += stats.strength;
			if (stats.intelligence) totalIntelligence += stats.intelligence;
			if (stats.luck) totalLuck += stats.luck;
			if (stats.health) totalHealth += stats.health;
		}
	}
	
	// Бонусы от навыков уже включены в базу (так как мы обновляем статы при получении)
	// Но мы можем возвращать список навыков вместе со статами
	const skills = await db.query.heroSkills.findMany({
		where: eq(heroSkills.heroId, heroId)
	});

	return {
		...hero,
		totalStrength,
		totalIntelligence,
		totalLuck,
		totalHealth,
		skills
	};
}

