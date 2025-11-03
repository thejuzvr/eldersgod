import { pgTable, serial, text, timestamp, integer, boolean, jsonb, uuid } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	email: text('email').notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	lastLogin: timestamp('last_login')
});

// Heroes table
export const heroes = pgTable('heroes', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id).notNull(),
	name: text('name').notNull(),
	race: text('race').notNull(), // Nord, Dark Elf, Khajiit, etc.
	level: integer('level').default(1).notNull(),
	experience: integer('experience').default(0).notNull(),
	gold: integer('gold').default(100).notNull(),
	dragonSouls: integer('dragon_souls').default(0).notNull(),
	currentHealth: integer('current_health').default(100).notNull(),
	maxHealth: integer('max_health').default(100).notNull(),
	strength: integer('strength').default(10).notNull(),
	intelligence: integer('intelligence').default(10).notNull(),
	luck: integer('luck').default(10).notNull(),
	title: text('title').default('Новичок').notNull(), // Абсурдный титул
	currentLocation: text('current_location').default('Вайтран').notNull(), // Текущая локация
	isActive: boolean('is_active').default(true).notNull(), // Для событий в реальном времени
	lastEventAt: timestamp('last_event_at').defaultNow(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Items table (базовые предметы)
export const items = pgTable('items', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	type: text('type').notNull(), // weapon, armor, artifact, consumable
	rarity: text('rarity').notNull(), // common, uncommon, rare, epic, legendary, absurd
	stats: jsonb('stats').notNull(), // {strength: 5, intelligence: 2, luck: 1}
	description: text('description').notNull(), // Абсурдное описание
	icon: text('icon').default('⚔️') // Unicode иконка
});

// Hero inventory (связь героев и предметов)
export const heroInventory = pgTable('hero_inventory', {
	id: serial('id').primaryKey(),
	heroId: integer('hero_id').references(() => heroes.id).notNull(),
	itemId: integer('item_id').references(() => items.id).notNull(),
	equipped: boolean('equipped').default(false).notNull(),
	acquiredAt: timestamp('acquired_at').defaultNow().notNull()
});

// Events log (дневник приключений)
export const eventsLog = pgTable('events_log', {
	id: serial('id').primaryKey(),
	heroId: integer('hero_id').references(() => heroes.id).notNull(),
	eventType: text('event_type').notNull(), // combat, exploration, social, absurd, death, idle
	content: jsonb('content').notNull(), // {title, description, thought, rewards, etc.}
	timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Arena battles (PvP бои)
export const arenaBattles = pgTable('arena_battles', {
	id: serial('id').primaryKey(),
	hero1Id: integer('hero1_id').references(() => heroes.id).notNull(),
	hero2Id: integer('hero2_id').references(() => heroes.id).notNull(),
	winnerId: integer('winner_id').references(() => heroes.id),
	battleLog: jsonb('battle_log').notNull(), // Абсурдный лог битвы
	rewards: jsonb('rewards'), // {exp, gold, items}
	timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Hero encounters (встречи героев в мире)
export const heroEncounters = pgTable('hero_encounters', {
	id: serial('id').primaryKey(),
	hero1Id: integer('hero1_id').references(() => heroes.id).notNull(),
	hero2Id: integer('hero2_id').references(() => heroes.id).notNull(),
	encounterType: text('encounter_type').notNull(), // rescue, theft, adventure, mention
	description: text('description').notNull(), // Описание встречи
	timestamp: timestamp('timestamp').defaultNow().notNull()
});

// Hero quests (задания для героев)
export const heroQuests = pgTable('hero_quests', {
	id: serial('id').primaryKey(),
	heroId: integer('hero_id').references(() => heroes.id).notNull(),
	title: text('title').notNull(),
	description: text('description').notNull(),
	icon: text('icon').default('📝'),
	status: text('status').default('active').notNull(), // active, completed, failed
	progress: jsonb('progress').default({}).notNull(), // {subtaskId: completed}
	subtasks: jsonb('subtasks').notNull(), // [{id, title, completed}]
	rewards: jsonb('rewards'), // {exp, gold, items}
	createdAt: timestamp('created_at').defaultNow().notNull(),
	completedAt: timestamp('completed_at')
});

// Hero skills (умения героев)
export const heroSkills = pgTable('hero_skills', {
	id: serial('id').primaryKey(),
	heroId: integer('hero_id').references(() => heroes.id).notNull(),
	name: text('name').notNull(),
	description: text('description').notNull(),
	icon: text('icon').default('📚'),
	level: integer('level').default(1).notNull(),
	category: text('category').notNull(), // combat, magic, stealth, social, absurd
	acquiredAt: timestamp('acquired_at').defaultNow().notNull()
});

// User ideas (идеи пользователей)
export const userIdeas = pgTable('user_ideas', {
	id: serial('id').primaryKey(),
	heroId: integer('hero_id').references(() => heroes.id).notNull(),
	category: text('category').notNull(),
	subject: text('subject'),
	content: text('content').notNull(),
	status: text('status').default('pending').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
	heroes: many(heroes)
}));

export const heroesRelations = relations(heroes, ({ one, many }) => ({
	user: one(users, {
		fields: [heroes.userId],
		references: [users.id]
	}),
	inventory: many(heroInventory),
	events: many(eventsLog),
	arenaBattlesAsHero1: many(arenaBattles),
	arenaBattlesAsHero2: many(arenaBattles),
	encountersAsHero1: many(heroEncounters),
	encountersAsHero2: many(heroEncounters),
	quests: many(heroQuests),
	skills: many(heroSkills)
}));

export const itemsRelations = relations(items, ({ many }) => ({
	heroInventory: many(heroInventory)
}));

export const heroInventoryRelations = relations(heroInventory, ({ one }) => ({
	hero: one(heroes, {
		fields: [heroInventory.heroId],
		references: [heroes.id]
	}),
	item: one(items, {
		fields: [heroInventory.itemId],
		references: [items.id]
	})
}));

export const eventsLogRelations = relations(eventsLog, ({ one }) => ({
	hero: one(heroes, {
		fields: [eventsLog.heroId],
		references: [heroes.id]
	})
}));

export const arenaBattlesRelations = relations(arenaBattles, ({ one }) => ({
	hero1: one(heroes, {
		fields: [arenaBattles.hero1Id],
		references: [heroes.id]
	}),
	hero2: one(heroes, {
		fields: [arenaBattles.hero2Id],
		references: [heroes.id]
	}),
	winner: one(heroes, {
		fields: [arenaBattles.winnerId],
		references: [heroes.id]
	})
}));

export const heroEncountersRelations = relations(heroEncounters, ({ one }) => ({
	hero1: one(heroes, {
		fields: [heroEncounters.hero1Id],
		references: [heroes.id]
	}),
	hero2: one(heroes, {
		fields: [heroEncounters.hero2Id],
		references: [heroes.id]
	})
}));

export const heroQuestsRelations = relations(heroQuests, ({ one }) => ({
	hero: one(heroes, {
		fields: [heroQuests.heroId],
		references: [heroes.id]
	})
}));

export const heroSkillsRelations = relations(heroSkills, ({ one }) => ({
	hero: one(heroes, {
		fields: [heroSkills.heroId],
		references: [heroes.id]
	})
}));

export const userIdeasRelations = relations(userIdeas, ({ one }) => ({
	hero: one(heroes, {
		fields: [userIdeas.heroId],
		references: [heroes.id]
	})
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Hero = typeof heroes.$inferSelect;
export type NewHero = typeof heroes.$inferInsert;

export type Item = typeof items.$inferSelect;
export type NewItem = typeof items.$inferInsert;

export type Quest = typeof heroQuests.$inferSelect;
export type NewQuest = typeof heroQuests.$inferInsert;

export type Skill = typeof heroSkills.$inferSelect;
export type NewSkill = typeof heroSkills.$inferInsert;

export type HeroInventoryItem = typeof heroInventory.$inferSelect;
export type NewHeroInventoryItem = typeof heroInventory.$inferInsert;

export type EventLog = typeof eventsLog.$inferSelect;
export type NewEventLog = typeof eventsLog.$inferInsert;

export type ArenaBattle = typeof arenaBattles.$inferSelect;
export type NewArenaBattle = typeof arenaBattles.$inferInsert;

export type HeroEncounter = typeof heroEncounters.$inferSelect;
export type NewHeroEncounter = typeof heroEncounters.$inferInsert;

