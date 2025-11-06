import { z } from 'zod';

// ========== БАЗОВЫЕ СХЕМЫ ==========

// Базовая схема для всего контента
export const GameContentSchema = z.object({
    id: z.number().optional(),
    type: z.enum(['title', 'thought', 'skill', 'item', 'creature', 'location', 'action']),
    category: z.string().nullable().optional(),
    name: z.string().max(100).nullable().optional(),
    text: z.string().max(1000).nullable().optional(),
    data: z.record(z.string(), z.unknown()).default({}),
    metadata: z.record(z.string(), z.unknown()).optional(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd']).optional(),
    isActive: z.boolean().default(true),
    weight: z.number().min(0).max(100).default(1),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional(),
    createdBy: z.number().optional(),
    tags: z.array(z.string()).optional(),
    unlockLevel: z.number().min(1).max(1000).default(1),
    icon: z.string().default('✨'),
    color: z.string().default('#ffffff')
});

// ========== СПЕЦИФИЧЕСКИЕ СХЕМЫ ДЛЯ ТИПОВ КОНТЕНТА ==========

// Схема для титулов
export const TitleSchema = GameContentSchema.extend({
    type: z.literal('title'),
    name: z.string().min(1).max(100),
    text: z.string().optional(),
    data: z.object({
        description: z.string().optional(),
        category: z.string().optional(),
        prestige: z.number().min(0).max(10).default(0)
    })
});

// Схема для мыслей
export const ThoughtSchema = GameContentSchema.extend({
    type: z.literal('thought'),
    name: z.string().optional(),
    text: z.string().min(1).max(500),
    category: z.enum([
        'general', 'combat', 'discovery', 'friendship', 'absurd', 'magic', 'food', 
        'adventure', 'philosophical', 'weapons', 'glory', 'failure', 'weather', 'night', 'idle'
    ]).optional(),
    data: z.object({
        mood: z.enum(['positive', 'negative', 'neutral', 'absurd']).optional(),
        context: z.string().optional(),
        emotion: z.string().optional()
    })
});

// Схема для навыков
export const SkillSchema = GameContentSchema.extend({
    type: z.literal('skill'),
    name: z.string().min(1).max(100),
    text: z.string().max(500).optional(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd']).default('common'),
    data: z.object({
        description: z.string(),
        level: z.number().min(1).max(100).default(1),
        experienceRequired: z.number().min(0).default(0),
        effects: z.array(z.object({
            type: z.string(),
            value: z.number(),
            duration: z.number().optional()
        })).optional(),
        requirements: z.object({
            level: z.number().optional(),
            otherSkills: z.array(z.string()).optional()
        }).optional()
    })
});

// Схема для предметов
export const ItemSchema = GameContentSchema.extend({
    type: z.literal('item'),
    name: z.string().min(1).max(100),
    text: z.string().max(500).optional(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd']),
    data: z.object({
        type: z.enum(['weapon', 'armor', 'artifact', 'consumable', 'material']),
        description: z.string(),
        stats: z.object({
            strength: z.number().default(0),
            intelligence: z.number().default(0),
            luck: z.number().default(0),
            health: z.number().default(0),
            mana: z.number().default(0)
        }),
        price: z.number().min(0).default(0),
        requirements: z.object({
            level: z.number().optional(),
            class: z.string().optional(),
            race: z.string().optional()
        }).optional(),
        effects: z.array(z.object({
            type: z.string(),
            description: z.string(),
            value: z.number()
        })).optional()
    })
});

// Схема для существ
export const CreatureSchema = GameContentSchema.extend({
    type: z.literal('creature'),
    name: z.string().min(1).max(100),
    text: z.string().max(500).optional(),
    data: z.object({
        description: z.string(),
        category: z.enum(['dragon', 'plant', 'animal', 'object', 'monster', 'humanoid']),
        behavior: z.enum(['peaceful', 'aggressive', 'neutral', 'chaotic']),
        health: z.number().min(1).default(100),
        strength: z.number().min(0).default(10),
        intelligence: z.number().min(0).default(10),
        specialAbilities: z.array(z.string()).optional(),
        habitat: z.string().optional(),
        drops: z.array(z.object({
            item: z.string(),
            chance: z.number().min(0).max(1)
        })).optional()
    })
});

// Схема для локаций
export const LocationSchema = GameContentSchema.extend({
    type: z.literal('location'),
    name: z.string().min(1).max(100),
    text: z.string().max(500).optional(),
    data: z.object({
        description: z.string(),
        category: z.enum(['city', 'dungeon', 'wilderness', 'special']),
        region: z.enum(['skyrim', 'morrowind', 'cyrodiil', 'other']),
        coordinates: z.object({
            x: z.number(),
            y: z.number()
        }).optional(),
        environment: z.enum(['forest', 'desert', 'mountain', 'city', 'cave', 'plains']),
        hazards: z.array(z.string()).optional(),
        treasures: z.array(z.string()).optional(),
        npcs: z.array(z.string()).optional()
    })
});

// Схема для действий
export const ActionSchema = GameContentSchema.extend({
    type: z.literal('action'),
    name: z.string().optional(),
    text: z.string().min(1).max(200),
    category: z.enum(['combat', 'exploration', 'social', 'absurd', 'general']).optional(),
    data: z.object({
        context: z.string().optional(),
        emotion: z.string().optional(),
        successRate: z.number().min(0).max(1).default(0.5)
    })
});

// ========== СХЕМЫ АНАЛИТИКИ ==========

export const ContentAnalyticsSchema = z.object({
    id: z.number().optional(),
    contentId: z.number(),
    usedCount: z.number().min(0).default(0),
    lastUsed: z.date().optional(),
    userRatings: z.record(z.string(), z.number().min(1).max(5)).default({}),
    averageRating: z.string().regex(/^\d+\.\d{2}$/).default('0.00'),
    totalRevenue: z.number().min(0).default(0),
    views: z.number().min(0).default(0),
    shares: z.number().min(0).default(0),
    createdAt: z.date().optional(),
    updatedAt: z.date().optional()
});

// ========== СХЕМЫ КАТЕГОРИЙ ==========

export const ContentCategorySchema = z.object({
    id: z.number().optional(),
    type: z.enum(['title', 'thought', 'skill', 'item', 'creature', 'location', 'action']),
    name: z.string().min(1).max(50),
    slug: z.string().min(1).max(50).regex(/^[a-z0-9-]+$/),
    description: z.string().max(500).optional(),
    icon: z.string().default('📁'),
    color: z.string().default('#666666'),
    isActive: z.boolean().default(true),
    sortOrder: z.number().default(0),
    createdAt: z.date().optional()
});

// ========== СХЕМЫ ПЕРЕВОДОВ ==========

export const ContentTranslationSchema = z.object({
    id: z.number().optional(),
    contentId: z.number(),
    field: z.enum(['name', 'text', 'description', 'category', 'metadata']),
    language: z.string().min(2).max(5),
    text: z.string().min(1).max(1000),
    isApproved: z.boolean().default(false),
    createdAt: z.date().optional(),
    createdBy: z.number().optional()
});

// ========== СХЕМЫ ВЕРСИЙ ==========

export const ContentVersionSchema = z.object({
    id: z.number().optional(),
    contentId: z.number(),
    version: z.number().min(1),
    data: z.record(z.string(), z.unknown()),
    changeLog: z.string().max(500).optional(),
    createdAt: z.date().optional(),
    createdBy: z.number().optional(),
    isActive: z.boolean().default(false)
});

// ========== СХЕМЫ ПОИСКА И ФИЛЬТРАЦИИ ==========

export const ContentFilterSchema = z.object({
    type: z.string().optional(),
    category: z.string().optional(),
    active: z.boolean().optional(),
    rarity: z.string().optional(),
    tags: z.array(z.string()).optional(),
    minWeight: z.number().min(0).optional(),
    maxWeight: z.number().min(0).optional(),
    unlockLevel: z.number().min(1).optional(),
    language: z.string().optional()
});

export const ContentSearchOptionsSchema = z.object({
    filter: ContentFilterSchema.optional(),
    sortBy: z.enum(['name', 'weight', 'createdAt', 'updatedAt', 'usedCount', 'rating']).default('name'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    limit: z.number().min(1).max(1000).default(20),
    offset: z.number().min(0).default(0),
    includeAnalytics: z.boolean().default(false),
    includeTranslations: z.boolean().default(false)
});

// ========== ОБЪЕДИНЁННАЯ СХЕМА ==========

export const AnyContentSchema = z.union([
    TitleSchema,
    ThoughtSchema,
    SkillSchema,
    ItemSchema,
    CreatureSchema,
    LocationSchema,
    ActionSchema
]);

// ========== ФУНКЦИИ ВАЛИДАЦИИ ==========

/**
 * Валидировать контент по его типу
 */
export function validateContentByType(content: any, type: string) {
    switch (type) {
        case 'title':
            return TitleSchema.safeParse(content);
        case 'thought':
            return ThoughtSchema.safeParse(content);
        case 'skill':
            return SkillSchema.safeParse(content);
        case 'item':
            return ItemSchema.safeParse(content);
        case 'creature':
            return CreatureSchema.safeParse(content);
        case 'location':
            return LocationSchema.safeParse(content);
        case 'action':
            return ActionSchema.safeParse(content);
        default:
            return GameContentSchema.safeParse(content);
    }
}

/**
 * Получить схему по типу контента
 */
export function getContentSchemaByType(type: string): z.ZodSchema<any> {
    switch (type) {
        case 'title':
            return TitleSchema;
        case 'thought':
            return ThoughtSchema;
        case 'skill':
            return SkillSchema;
        case 'item':
            return ItemSchema;
        case 'creature':
            return CreatureSchema;
        case 'location':
            return LocationSchema;
        case 'action':
            return ActionSchema;
        default:
            return GameContentSchema;
    }
}

/**
 * Форматировать ошибки валидации для пользователя
 */
export function formatValidationErrors(error: z.ZodError<any>): string[] {
    return error.issues.map((err: any) => {
        const field = err.path.join('.');
        return `${field ? `${field}: ` : ''}${err.message}`;
    });
}

/**
 * Создать валидный контент с значениями по умолчанию
 */
export function createValidContent(type: string, data: any = {}) {
    const schema = getContentSchemaByType(type);
    
    try {
        return schema.parse({
            type,
            ...data
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error(`Validation failed: ${formatValidationErrors(error).join(', ')}`);
        }
        throw error;
    }
}

// ========== КОНСТАНТЫ ДЛЯ ВАЛИДАЦИИ ==========

export const CONTENT_TYPES = ['title', 'thought', 'skill', 'item', 'creature', 'location', 'action'] as const;
export const RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd'] as const;
export const THOUGHT_CATEGORIES = [
    'general', 'combat', 'discovery', 'friendship', 'absurd', 'magic', 'food', 
    'adventure', 'philosophical', 'weapons', 'glory', 'failure', 'weather', 'night', 'idle'
] as const;
export const LANGUAGES = ['ru', 'en', 'fr', 'de', 'es', 'it', 'ja', 'ko', 'zh'] as const;

export type ContentType = typeof CONTENT_TYPES[number];
export type Rarity = typeof RARITIES[number];
export type ThoughtCategory = typeof THOUGHT_CATEGORIES[number];
export type Language = typeof LANGUAGES[number];

// ========== ТИПЫ ДАННЫХ ==========

export type TitleData = z.infer<typeof TitleSchema>;
export type ThoughtData = z.infer<typeof ThoughtSchema>;
export type SkillData = z.infer<typeof SkillSchema>;
export type ItemData = z.infer<typeof ItemSchema>;
export type CreatureData = z.infer<typeof CreatureSchema>;
export type LocationData = z.infer<typeof LocationSchema>;
export type ActionData = z.infer<typeof ActionSchema>;

export type GameContentData = z.infer<typeof GameContentSchema>;
export type ContentAnalyticsData = z.infer<typeof ContentAnalyticsSchema>;
export type ContentCategoryData = z.infer<typeof ContentCategorySchema>;
export type ContentFilterData = z.infer<typeof ContentFilterSchema>;
export type ContentSearchOptionsData = z.infer<typeof ContentSearchOptionsSchema>;