import { db } from '../server/db';
import { gameContent, contentAnalytics, contentCategories } from '../server/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { redisClient as redis } from '../server/redis';
import { z } from 'zod';
import { getContentSchemaByType, type ContentSearchOptionsData } from '../utils/contentValidators';
import type { GameContent, NewGameContent } from '../server/db/schema';

// ========== КОНСТАНТЫ КЭШИРОВАНИЯ ==========
const CACHE_PREFIX = 'content:';
const CACHE_TTL = {
    SHORT: 300,    // 5 минут
    MEDIUM: 1800,  // 30 минут
    LONG: 3600,    // 1 час
    DAY: 86400     // 1 день
};

const CACHE_KEYS = {
    LIST: (filter: string) => `${CACHE_PREFIX}list:${filter}`,
    ITEM: (id: number) => `${CACHE_PREFIX}item:${id}`,
    STATS: `${CACHE_PREFIX}stats`,
    RANDOM: (type: string, filter: string) => `${CACHE_PREFIX}random:${type}:${filter}`,
    ALL_TYPES: `${CACHE_PREFIX}types`,
    SEARCH: (query: string) => `${CACHE_PREFIX}search:${Buffer.from(query).toString('base64')}`
};

export class ContentService {
    /**
     * Поиск контента с кэшированием
     */
    static async searchContent(options: ContentSearchOptionsData): Promise<{
        items: GameContent[];
        total: number;
        hasMore: boolean;
        limit: number;
        offset: number;
    }> {
        const cacheKey = CACHE_KEYS.SEARCH(JSON.stringify(options));
        
        // Пытаемся получить из кэша
        const cached = await this.getCache<{
            items: GameContent[];
            total: number;
            hasMore: boolean;
            limit: number;
            offset: number;
        }>(cacheKey);
        if (cached) {
            return cached;
        }

        // Строим запрос
        let query = db.select().from(gameContent);
        const conditions: any[] = [];

        if (options.filter) {
            const filter = options.filter;

            if (filter.type) {
                conditions.push(eq(gameContent.type, filter.type));
            }
            if (filter.category) {
                conditions.push(eq(gameContent.category, filter.category));
            }
            if (filter.active !== undefined) {
                conditions.push(eq(gameContent.isActive, filter.active));
            }
            if (filter.rarity) {
                conditions.push(eq(gameContent.rarity, filter.rarity));
            }
            if (filter.unlockLevel) {
                conditions.push(sql`${gameContent.unlockLevel} <= ${filter.unlockLevel}`);
            }
            if (filter.tags && filter.tags.length > 0) {
                conditions.push(sql`${gameContent.tags} && ${filter.tags}`);
            }
            if (filter.minWeight) {
                conditions.push(sql`${gameContent.weight} >= ${filter.minWeight}`);
            }
            if (filter.maxWeight) {
                conditions.push(sql`${gameContent.weight} <= ${filter.maxWeight}`);
            }
        }

        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        // Сортировка - упрощенная версия
        const orderBy: any[] = [desc(gameContent.createdAt)];

        // Пагинация
        const limit = Math.min(options.limit || 20, 100);
        const offset = options.offset || 0;

        query = query
            .orderBy(...orderBy)
            .limit(limit)
            .offset(offset) as any;

        // Выполняем запрос
        const items = await query;

        // Получаем общее количество для пагинации
        const totalCount = await this.getTotalCount(options.filter);

        const result = {
            items,
            total: totalCount,
            hasMore: offset + limit < totalCount,
            limit,
            offset
        };

        // Кэшируем результат
        await this.setCache(cacheKey, result, CACHE_TTL.MEDIUM);

        return result;
    }

    /**
     * Создать новый контент с кэшированием
     */
    static async createContent(content: NewGameContent): Promise<GameContent> {
        // Создаем в БД
        const [newContent] = await db.insert(gameContent).values({
            ...content,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();

        // Инвалидируем связанные кэши
        await this.invalidateRelatedCaches('create', newContent.type, newContent.category || undefined);

        return newContent;
    }

    /**
     * Обновить контент с кэшированием
     */
    static async updateContent(id: number, updates: Partial<GameContent>): Promise<GameContent> {
        const [updatedContent] = await db.update(gameContent)
            .set({
                ...updates,
                updatedAt: new Date()
            })
            .where(eq(gameContent.id, id))
            .returning();

        if (!updatedContent) {
            throw new Error('Content not found');
        }

        // Инвалидируем кэши
        await this.invalidateContentCache(id);
        await this.invalidateRelatedCaches('update', updatedContent.type, updatedContent.category || undefined);

        return updatedContent;
    }

    /**
     * Удалить контент (мягкое удаление)
     */
    static async deleteContent(id: number): Promise<void> {
        const [deletedContent] = await db.update(gameContent)
            .set({
                isActive: false,
                updatedAt: new Date()
            })
            .where(eq(gameContent.id, id))
            .returning();

        if (!deletedContent) {
            throw new Error('Content not found');
        }

        // Инвалидируем кэши
        await this.invalidateContentCache(id);
        await this.invalidateRelatedCaches('delete', deletedContent.type, deletedContent.category || undefined);
    }

    /**
     * Получить случайный контент с кэшированием
     */
    static async getRandomContent(type: string, filter: any = {}): Promise<GameContent | null> {
        const cacheKey = CACHE_KEYS.RANDOM(type, JSON.stringify(filter));
        
        // Пытаемся получить из кэша
        const cached = await this.getCache<GameContent>(cacheKey);
        if (cached) {
            return cached;
        }

        // Создаем фильтр для поиска
        const searchOptions: ContentSearchOptionsData = {
            filter: { type, active: true, ...filter },
            limit: 50,
            sortBy: 'weight',
            sortOrder: 'desc',
            offset: 0,
            includeAnalytics: false,
            includeTranslations: false
        };

        // Ищем контент
        const result = await this.searchContent(searchOptions);
        
        if (!result || !result.items || result.items.length === 0) {
            return null;
        }

        // Выбираем случайный элемент из результатов
        const randomIndex = Math.floor(Math.random() * result.items.length);
        const randomContent = result.items[randomIndex];

        // Кэшируем результат на короткое время
        await this.setCache(cacheKey, randomContent, CACHE_TTL.SHORT);

        return randomContent;
    }

    /**
     * Получить статистику контента
     */
    static async getContentStats() {
        const cacheKey = CACHE_KEYS.STATS;
        
        const cached = await this.getCache(cacheKey);
        if (cached) {
            return cached;
        }

        // Получаем все активные элементы
        const allContent = await db.select().from(gameContent).where(eq(gameContent.isActive, true));
        
        const stats = {
            total: allContent.length,
            active: allContent.filter(item => item.isActive).length,
            inactive: allContent.filter(item => !item.isActive).length,
            byType: this.groupBy(allContent, 'type'),
            byRarity: this.groupBy(allContent, 'rarity'),
            avgWeight: Math.round(allContent.reduce((sum, item) => sum + (item.weight || 0), 0) / allContent.length || 0),
            recentItems: allContent.filter(item => {
                const updateTime = new Date(item.updatedAt || item.createdAt || Date.now());
                return (Date.now() - updateTime.getTime()) < 7 * 24 * 60 * 60 * 1000; // 7 дней
            }).length
        };

        // Кэшируем на долгое время
        await this.setCache(cacheKey, stats, CACHE_TTL.LONG);

        return stats;
    }

    /**
     * Отслеживать использование контента
     */
    static async trackUsage(contentId: number): Promise<void> {
        // Обновляем счетчик использования
        await db.insert(contentAnalytics)
            .values({
                contentId,
                usedCount: 1,
                lastUsed: new Date(),
                views: 1
            })
            .onConflictDoUpdate({
                target: contentAnalytics.contentId,
                set: {
                    usedCount: sql`${contentAnalytics.usedCount} + 1`,
                    lastUsed: new Date(),
                    views: sql`${contentAnalytics.views} + 1`
                }
            });

        // Инвалидируем кэш статистики
        await this.deleteCache(CACHE_KEYS.STATS);
    }

    /**
     * Поиск по тексту с кэшированием
     */
    static async searchByText(query: string, limit: number = 20) {
        const cacheKey = CACHE_KEYS.SEARCH(query);
        
        const cached = await this.getCache(cacheKey);
        if (cached) {
            return cached;
        }

        const results = await db.select()
            .from(gameContent)
            .where(
                and(
                    eq(gameContent.isActive, true),
                    sql`(${gameContent.name} ILIKE '%' || ${query} || '%' OR ${gameContent.text} ILIKE '%' || ${query} || '%')`
                )
            )
            .limit(limit);

        await this.setCache(cacheKey, results, CACHE_TTL.MEDIUM);

        return results;
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ КЭШИРОВАНИЯ ==========

    /**
     * Получить данные из кэша
     */
    private static async getCache<T>(key: string): Promise<T | null> {
        if (!redis) return null;
        
        try {
            const data = await redis.get(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.warn('Cache get error:', error);
            return null;
        }
    }

    /**
     * Установить данные в кэш
     */
    private static async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
        if (!redis) return;
        
        try {
            await redis.setex(key, ttl, JSON.stringify(data));
        } catch (error) {
            console.warn('Cache set error:', error);
        }
    }

    /**
     * Удалить данные из кэша
     */
    private static async deleteCache(key: string): Promise<void> {
        if (!redis) return;
        
        try {
            await redis.del(key);
        } catch (error) {
            console.warn('Cache delete error:', error);
        }
    }

    /**
     * Инвалидировать кэш конкретного элемента
     */
    private static async invalidateContentCache(id: number): Promise<void> {
        await this.deleteCache(CACHE_KEYS.ITEM(id));
        
        // Инвалидируем общий кэш поиска (можно улучшить через pattern matching)
        await this.invalidateListCaches();
    }

    /**
     * Инвалидировать кэши связанные с типом/категорией
     */
    private static async invalidateRelatedCaches(action: string, type?: string, category?: string): Promise<void> {
        await this.invalidateListCaches();
        await this.deleteCache(CACHE_KEYS.STATS);
        
        if (type) {
            await this.deleteCache(CACHE_KEYS.RANDOM(type, '{}'));
        }
    }

    /**
     * Инвалидировать все кэши списков
     */
    private static async invalidateListCaches(): Promise<void> {
        if (!redis) return;
        
        try {
            // Удаляем все кэши контента по паттерну
            const keys = await redis.keys(`${CACHE_PREFIX}*`);
            if (keys.length > 0) {
                // Удаляем ключи по одному для избежания проблем с типами
                for (const key of keys) {
                    await redis.del(key);
                }
            }
        } catch (error) {
            console.warn('Cache invalidate error:', error);
        }
    }

    /**
     * Получить общее количество элементов
     */
    private static async getTotalCount(filter: any = {}): Promise<number> {
        let query = db.select({ count: count() }).from(gameContent);
        const conditions: any[] = [];

        if (filter) {
            if (filter.type) {
                conditions.push(eq(gameContent.type, filter.type));
            }
            if (filter.category) {
                conditions.push(eq(gameContent.category, filter.category));
            }
            if (filter.active !== undefined) {
                conditions.push(eq(gameContent.isActive, filter.active));
            }
            if (filter.rarity) {
                conditions.push(eq(gameContent.rarity, filter.rarity));
            }
            if (filter.unlockLevel) {
                conditions.push(sql`${gameContent.unlockLevel} <= ${filter.unlockLevel}`);
            }
        }

        if (conditions.length > 0) {
            // Упрощенная версия без сложных условий
            if (filter.type) {
                query = query.where(eq(gameContent.type, filter.type)) as any;
            }
        }

        const result = await query;
        return result[0]?.count || 0;
    }

    /**
     * Группировка массива по полю
     */
    private static groupBy<T>(array: T[], key: keyof T): Record<string, number> {
        return array.reduce((groups, item) => {
            const value = String(item[key] || 'без категории');
            groups[value] = (groups[value] || 0) + 1;
            return groups;
        }, {} as Record<string, number>);
    }

    // ========== УДОБНЫЕ МЕТОДЫ ДЛЯ ИГРЫ ==========

    /**
     * Получить случайный титул
     */
    static async getRandomTitle(level?: number) {
        const filter: any = { active: true, type: 'title' };
        if (level) {
            filter.unlockLevel = level;
        }

        const titleData = await this.getRandomContent('title', filter);
        return titleData?.name || 'Неизвестный титул';
    }

    /**
     * Получить случайную мысль
     */
    static async getRandomThought(category?: string) {
        const filter: any = { active: true, type: 'thought' };
        if (category) {
            filter.category = category;
        }

        const thoughtData = await this.getRandomContent('thought', filter);
        return thoughtData?.text || 'Мысль потерялась в пространстве...';
    }

    /**
     * Получить случайный предмет
     */
    static async getRandomItem(rarity?: string) {
        const filter: any = { active: true, type: 'item' };
        if (rarity) {
            filter.rarity = rarity;
        }

        return await this.getRandomContent('item', filter);
    }

    /**
     * Загрузить контент для игры
     */
    static async loadContent(type: string, options: { filter?: any, limit?: number } = {}) {
        return await this.searchContent({
            filter: { type, active: true, ...options.filter },
            limit: options.limit || 100,
            sortBy: 'weight',
            sortOrder: 'desc',
            offset: 0,
            includeAnalytics: false,
            includeTranslations: false
        });
    }
}