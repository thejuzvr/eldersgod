import { db } from '../server/db';
import { gameContent, contentAnalytics, contentCategories } from '../server/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import type { GameContent, NewGameContent } from '../server/db/schema';

// Упрощенная версия ContentService без Redis кэширования для избежания TypeScript проблем
export class ContentService {
    /**
     * Поиск контента
     */
    static async searchContent(options: any = {}) {
        // Строим базовый запрос
        let query = db.select().from(gameContent);
        const conditions: any[] = [];

        // Применяем фильтры
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
        }

        // Применяем условия
        if (conditions.length > 0) {
            query = query.where(and(...conditions)) as any;
        }

        // Сортировка
        query = query.orderBy(desc(gameContent.createdAt)) as any;

        // Пагинация
        const limit = Math.min(options.limit || 20, 100);
        const offset = options.offset || 0;

        query = query.limit(limit).offset(offset) as any;

        // Выполняем запрос
        const items = await query;

        // Подсчет общего количества
        let totalCount = 0;
        try {
            const countQuery = db.select({ count: count() }).from(gameContent);
            if (conditions.length > 0) {
                countQuery.where(and(...conditions));
            }
            const result = await countQuery;
            totalCount = result[0]?.count || 0;
        } catch (error) {
            console.warn('Error getting total count:', error);
            totalCount = items.length;
        }

        return {
            items,
            total: totalCount,
            hasMore: offset + limit < totalCount,
            limit,
            offset
        };
    }

    /**
     * Создать новый контент
     */
    static async createContent(content: NewGameContent): Promise<GameContent> {
        const [newContent] = await db.insert(gameContent).values({
            ...content,
            createdAt: new Date(),
            updatedAt: new Date()
        }).returning();

        return newContent;
    }

    /**
     * Обновить контент
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
    }

    /**
     * Получить случайный контент
     */
    static async getRandomContent(type: string, filter: any = {}): Promise<GameContent | null> {
        const searchOptions: any = {
            filter: { type, active: true, ...filter },
            limit: 50,
            sortBy: 'weight',
            sortOrder: 'desc',
            offset: 0
        };

        const result = await this.searchContent(searchOptions);
        
        if (!result || !result.items || result.items.length === 0) {
            return null;
        }

        // Выбираем случайный элемент
        const randomIndex = Math.floor(Math.random() * result.items.length);
        return result.items[randomIndex];
    }

    /**
     * Получить статистику контента
     */
    static async getContentStats() {
        try {
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
                    return (Date.now() - updateTime.getTime()) < 7 * 24 * 60 * 60 * 1000;
                }).length
            };

            return stats;
        } catch (error) {
            console.error('Error getting content stats:', error);
            return {
                total: 0,
                active: 0,
                inactive: 0,
                byType: {},
                byRarity: {},
                avgWeight: 0,
                recentItems: 0
            };
        }
    }

    /**
     * Отслеживать использование контента
     */
    static async trackUsage(contentId: number): Promise<void> {
        try {
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
        } catch (error) {
            console.warn('Error tracking usage:', error);
        }
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
            sortBy: 'weight',
            sortOrder: 'desc',
            limit: options.limit || 100,
            offset: 0
        });
    }
}