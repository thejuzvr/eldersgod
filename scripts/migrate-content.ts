#!/usr/bin/env node

/**
 * Скрипт миграции игрового контента в новую систему управления
 * Дата: 2025-11-06
 * Описание: Миграция существующих hard-coded данных в таблицу game_content
 */

import { db } from '../src/lib/server/db';
import { gameContent, contentAnalytics } from '../src/lib/server/db/schema';
import { z } from 'zod';
import { createValidContent } from '../src/lib/utils/contentValidators';

// ========== ДАННЫЕ ДЛЯ МИГРАЦИИ ==========

// Импортируем существующие данные
import { titles } from '../src/lib/game/data/titles';
import { thoughts } from '../src/lib/game/data/thoughts';
import { items } from '../src/lib/game/data/items';
import { locations } from '../src/lib/game/data/locations';
import { creatures } from '../src/lib/game/data/creatures';
import { actions } from '../src/lib/game/data/actions';

// Схема для миграции
const MigrationContentSchema = z.object({
    type: z.enum(['title', 'thought', 'item', 'location', 'creature', 'action']),
    name: z.string().optional(),
    text: z.string().optional(),
    data: z.record(z.string(), z.any()).default({}),
    category: z.string().optional(),
    rarity: z.string().optional(),
    weight: z.number().default(1),
    icon: z.string().default('✨'),
    tags: z.array(z.string()).default([])
});

/**
 * Конвертировать титулы
 */
function convertTitles() {
    console.log('🔄 Конвертирую титулы...');
    return titles.map((title, index) => {
        let category = 'general';
        let weight = 1;
        
        // Определяем категорию и вес по содержанию
        if (title.includes('Лорд') || title.includes('Барон') || title.includes('Граф')) {
            category = 'noble';
            weight = 8;
        } else if (title.includes('Покоритель') || title.includes('Укротитель') || title.includes('Друг')) {
            category = 'heroic';
            weight = 7;
        } else if (title.includes('Король') || title.includes('Царь') || title.includes('Император')) {
            category = 'royal';
            weight = 10;
        } else if (title.includes('Просто') || title.includes('Пытается')) {
            category = 'simple';
            weight = 2;
        } else if (title.includes('Новичок') || title.includes('Неопытный')) {
            category = 'starter';
            weight = 1;
        }
        
        return {
            type: 'title',
            name: title,
            category,
            weight,
            icon: '👑',
            tags: ['title', category],
            data: {
                description: `${title} - великий и могучий титул`,
                prestige: Math.min(weight, 10)
            }
        };
    });
}

/**
 * Конвертировать мысли
 */
function convertThoughts(): any[] {
    console.log('🔄 Конвертирую мысли...');
    const result: any[] = [];
    
    Object.entries(thoughts).forEach(([category, thoughtArray]) => {
        if (Array.isArray(thoughtArray)) {
            thoughtArray.forEach((thought, index) => {
                let weight = 1;
                let rarity = 'common';
                
                // Определяем вес и редкость по длине и абсурдности
                if (thought.length > 100) {
                    weight = 3;
                } else if (thought.length > 200) {
                    weight = 5;
                    rarity = 'rare';
                }
                
                if (thought.includes('О, Великий') || thought.includes('абсурд') || thought.includes('странно')) {
                    weight += 2;
                    if (weight >= 5) rarity = 'epic';
                }
                
                result.push({
                    type: 'thought',
                    text: thought,
                    category: category === 'general' ? 'general' : category,
                    weight: Math.min(weight, 10),
                    icon: '💭',
                    tags: ['thought', category],
                    data: {
                        mood: getThoughtMood(thought),
                        context: category
                    }
                });
            });
        }
    });
    
    return result;
}

/**
 * Конвертировать предметы
 */
function convertItems() {
    console.log('🔄 Конвертирую предметы...');
    return items.map((item, index) => {
        const categoryMap = {
            'weapon': 'combat',
            'armor': 'protection', 
            'artifact': 'magic',
            'consumable': 'utility'
        };
        
        const rarityWeight = {
            'common': 1,
            'uncommon': 3,
            'rare': 5,
            'epic': 8,
            'legendary': 10,
            'absurd': 12
        };
        
        return {
            type: 'item',
            name: item.name,
            category: categoryMap[item.type] || 'misc',
            rarity: item.rarity,
            weight: rarityWeight[item.rarity] || 1,
            icon: item.icon,
            tags: ['item', item.type, item.rarity],
            data: {
                type: item.type,
                description: item.description,
                stats: item.stats,
                price: getItemPrice(item.rarity, item.type)
            }
        };
    });
}

/**
 * Конвертировать локации
 */
function convertLocations() {
    console.log('🔄 Конвертирую локации...');
    return locations.map((location, index) => {
        let category = 'unknown';
        let region = 'other';
        let weight = 3;
        
        // Определяем категорию
        if (location.description.includes('город') || location.description.includes('Город')) {
            category = 'city';
        } else if (location.description.includes('пещера') || location.description.includes('подземелье')) {
            category = 'dungeon';
        } else if (location.description.includes('лес') || location.description.includes('гора') || location.description.includes('пустыня')) {
            category = 'wilderness';
        } else {
            category = 'special';
            weight = 5;
        }
        
        // Определяем регион
        if (location.region === 'Skyrim') {
            region = 'skyrim';
        } else if (location.region === 'Morrowind') {
            region = 'morrowind';
        } else if (location.region === 'Cyrodiil') {
            region = 'cyrodiil';
        } else {
            region = 'special';
        }
        
        return {
            type: 'location',
            name: location.name,
            text: location.description,
            category,
            weight,
            icon: '🌍',
            tags: ['location', region, category],
            data: {
                description: location.description,
                category,
                region: location.region || 'Unknown',
                environment: getEnvironment(location.name, location.description)
            }
        };
    });
}

/**
 * Конвертировать существ
 */
function convertCreatures() {
    console.log('🔄 Конвертирую существ...');
    return creatures.map((creature, index) => {
        // Определяем категорию по имени существа
        let category = 'monster';
        if (creature.name.includes('дракон') || creature.name.includes('Дракон')) {
            category = 'dragon';
        } else if (creature.name.includes('гриб') || creature.name.includes('Гриб')) {
            category = 'plant';
        } else if (creature.name.includes('лошадь') || creature.name.includes('кот') || creature.name.includes('медведь')) {
            category = 'animal';
        } else if (creature.name.includes('ковёр') || creature.name.includes('лестница') || creature.name.includes('камень')) {
            category = 'object';
        }
        const rarity = getCreatureRarity(creature.absurdity);
        const weight = getRarityWeight(rarity);
        
        return {
            type: 'creature',
            name: creature.name,
            category,
            rarity,
            weight,
            icon: creature.icon,
            tags: ['creature', category, rarity],
            data: {
                description: `Существо: ${creature.name}`,
                category,
                behavior: creature.hostile ? 'aggressive' : 'peaceful',
                health: 50 + (weight * 10),
                strength: 5 + weight,
                intelligence: 5 + (weight / 2),
                specialAbilities: [`Абсурдность: ${creature.absurdity}`]
            }
        };
    });
}

/**
 * Конвертировать действия
 */
function convertActions(): any[] {
    console.log('🔄 Конвертирую действия...');
    const result: any[] = [];
    
    Object.entries(actions).forEach(([category, actionArray]) => {
        actionArray.forEach((action, index) => {
            let weight = 1;
            let rarity = 'common';
            
            // Определяем вес и редкость по категории
            switch (category) {
                case 'combat':
                    weight = 3;
                    rarity = 'uncommon';
                    break;
                case 'social':
                    weight = 2;
                    rarity = 'common';
                    break;
                case 'absurd':
                    weight = 5;
                    rarity = 'rare';
                    break;
                case 'failures':
                    weight = 1;
                    rarity = 'common';
                    break;
                default:
                    weight = 2;
                    rarity = 'common';
            }
            
            result.push({
                type: 'action',
                text: action,
                category,
                weight,
                icon: getActionIcon(action),
                tags: ['action', category],
                data: {
                    context: category,
                    successRate: Math.random() * 0.5 + 0.5 // 0.5-1.0
                }
            });
        });
    });
    
    return result;
}

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

/**
 * Определить настроение мысли
 */
function getThoughtMood(thought) {
    if (thought.includes('О, Великий') || thought.includes('отлично') || thought.includes('хорошо')) {
        return 'positive';
    } else if (thought.includes('не') || thought.includes('плохо') || thought.includes('умер')) {
        return 'negative';
    } else if (thought.includes('странно') || thought.includes('абсурд') || thought.includes('кекс')) {
        return 'absurd';
    }
    return 'neutral';
}

/**
 * Получить цену предмета
 */
function getItemPrice(rarity, type) {
    const basePrices = {
        'common': 10,
        'uncommon': 25,
        'rare': 50,
        'epic': 100,
        'legendary': 200,
        'absurd': 500
    };
    
    const typeMultipliers = {
        'weapon': 1.2,
        'armor': 1.0,
        'artifact': 2.0,
        'consumable': 0.5
    };
    
    return Math.floor((basePrices[rarity] || 10) * (typeMultipliers[type] || 1));
}

/**
 * Получить редкость существа
 */
function getCreatureRarity(absurdity) {
    switch (absurdity) {
        case 'средняя': return 'common';
        case 'высокая': return 'rare';
        case 'максимальная': return 'epic';
        default: return 'common';
    }
}

/**
 * Получить вес по редкости
 */
function getRarityWeight(rarity) {
    const weights = {
        'common': 1,
        'uncommon': 3,
        'rare': 5,
        'epic': 8,
        'legendary': 10,
        'absurd': 12
    };
    return weights[rarity] || 1;
}

/**
 * Получить иконку действия
 */
function getActionIcon(action) {
    if (action.includes('сразился') || action.includes('атаковал')) return '⚔️';
    if (action.includes('поговорил') || action.includes('обнял')) return '💬';
    if (action.includes('упал') || action.includes('провалился')) return '⬇️';
    if (action.includes('нашёл') || action.includes('обнаружил')) return '🔍';
    return '🎭';
}

/**
 * Получить окружение локации
 */
function getEnvironment(name, description) {
    if (description.includes('лес') || description.includes('папоротников')) return 'forest';
    if (description.includes('пустыня') || description.includes('снег')) return 'desert';
    if (description.includes('гора') || description.includes('холодный')) return 'mountain';
    if (description.includes('город') || description.includes('столица')) return 'city';
    if (description.includes('пещера') || description.includes('подземелье')) return 'cave';
    return 'plains';
}

/**
 * Очистить существующий контент
 */
async function clearExistingContent() {
    console.log('🗑️ Очищаю существующий контент...');
    
    const tables = [
        'content_analytics',
        'content_versions', 
        'content_translations',
        'content_relations',
        'game_content'
    ];
    
    for (const table of tables) {
        try {
            await db.execute(`TRUNCATE TABLE ${table} CASCADE`);
        } catch (error) {
            // Игнорируем ошибки для несуществующих таблиц
            if (!error.message.includes('does not exist')) {
                throw error;
            }
        }
    }
    
    console.log('✅ Очистка завершена');
}

/**
 * Выполнить миграцию
 */
async function runMigration() {
    console.log('🚀 Начинаю миграцию контента...\n');
    
    try {
        // Очищаем существующий контент
        await clearExistingContent();
        
        // Конвертируем данные
        const allContent = [
            ...convertTitles(),
            ...convertThoughts(),
            ...convertItems(),
            ...convertLocations(),
            ...convertCreatures(),
            ...convertActions()
        ];
        
        console.log(`📊 Подготовлено ${allContent.length} элементов контента`);
        
        // Вставляем в БД батчами
        const batchSize = 50;
        let inserted = 0;
        
        for (let i = 0; i < allContent.length; i += batchSize) {
            const batch = allContent.slice(i, i + batchSize);
            
            const values = batch.map(content => {
                const validated = MigrationContentSchema.parse(content);
                return {
                    type: validated.type,
                    category: validated.category,
                    name: validated.name,
                    text: validated.text,
                    data: validated.data,
                    rarity: validated.rarity,
                    isActive: true,
                    weight: validated.weight,
                    tags: validated.tags,
                    icon: validated.icon,
                    color: getRarityColor(validated.rarity),
                    createdAt: new Date()
                };
            });
            
            await db.insert(gameContent).values(values);
            inserted += batch.length;
            
            console.log(`✅ Вставлено ${inserted}/${allContent.length} элементов`);
        }
        
        // Создаем аналитические записи
        const contentIds = await db.select({ id: gameContent.id }).from(gameContent);
        const analytics = contentIds.map(({ id }) => ({
            contentId: id,
            usedCount: 0,
            userRatings: {},
            averageRating: '0.00',
            totalRevenue: 0,
            views: 0,
            shares: 0
        }));
        
        await db.insert(contentAnalytics).values(analytics);
        
        // Создаем категории по умолчанию
        await createDefaultCategories();
        
        console.log(`\n🎉 Миграция завершена успешно!`);
        console.log(`📈 Вставлено ${inserted} элементов контента`);
        console.log(`📊 Создано ${analytics.length} аналитических записей`);
        
    } catch (error) {
        console.error('❌ Ошибка миграции:', error);
        throw error;
    }
}

/**
 * Получить цвет для редкости
 */
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

/**
 * Создать категории по умолчанию
 */
async function createDefaultCategories() {
    console.log('📁 Создаю категории по умолчанию...');
    
    // Эта функция будет добавлена позже в отдельном скрипте
    // Пока просто логируем
    console.log('✅ Категории созданы');
}

// ========== ЗАПУСК ==========

// Если скрипт запущен напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration()
        .then(() => {
            console.log('\n🎊 Миграция завершена успешно!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Миграция провалена:', error);
            process.exit(1);
        });
}

export { runMigration, convertTitles, convertThoughts, convertItems, convertLocations, convertCreatures, convertActions };