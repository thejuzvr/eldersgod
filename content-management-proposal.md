# Content Management System - Предложения по улучшению

## 📋 Текущее состояние
В игре присутствует **7 файлов с hard-coded данными**:
- `titles.ts` - 100+ титулов
- `thoughts.ts` - 200+ мыслей 
- `skills.ts` - 38 умений
- `locations.ts` - 37 локаций
- `items.ts` - 42 предмета
- `creatures.ts` - 71 существо
- `actions.ts` - глаголы и действия

## 🚨 Проблемы текущей системы

1. **Статичный контент** - невозможно добавить новый контент без изменения кода
2. **Нет валидации** - ошибки в данных не отслеживаются
3. **Сложность масштабирования** - рост кода и связанность компонентов
4. **Отсутствие админ-панели** - только программное управление
5. **Нет версионирования** - невозможно отследить изменения
6. **Отсутствие локализации** - только русский язык
7. **Нет аналитики** - нет данных о популярности контента

## 💡 Предложения по улучшению

### 1. База данных для контента

**Новая схема БД:**
```typescript
// Создать таблицы для контента
export const gameContent = pgTable('game_content', {
    id: serial('id').primaryKey(),
    type: text('type').notNull(), // 'title', 'thought', 'skill', 'item', etc.
    category: text('category'),
    data: jsonb('data').notNull(), // Основные данные контента
    metadata: jsonb('metadata'), // Дополнительная информация
    rarity: text('rarity'), // Для предметов/умений
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    createdBy: integer('created_by').references(() => users.id),
    tags: text('tags').array(), // Для поиска и группировки
    weight: integer('weight').default(1), // Вес при случайном выборе
});

export const contentCategories = pgTable('content_categories', {
    id: serial('id').primaryKey(),
    type: text('type').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    isActive: boolean('is_active').default(true).notNull(),
});

export const contentAnalytics = pgTable('content_analytics', {
    id: serial('id').primaryKey(),
    contentId: integer('content_id').references(() => gameContent.id).notNull(),
    usedCount: integer('used_count').default(0).notNull(),
    lastUsed: timestamp('last_used'),
    userRating: decimal('user_rating', { precision: 3, scale: 2 }),
});
```

### 2. Content Management Service

**Создать `src/lib/services/contentService.ts`:**
```typescript
export class ContentService {
    // Загрузка всего контента в кэш при старте
    static async loadAllContent(): Promise<void> {
        // Загрузка из БД с кэшированием
    }
    
    // Получение контента по типу и категории
    static async getContent<T>(type: string, category?: string, activeOnly = true): Promise<T[]> {
        // Получение с учётом веса и активности
    }
    
    // Случайный выбор с учётом веса
    static getRandomWeighted<T>(items: T[], weightField = 'weight'): T {
        // Алгоритм weighted random
    }
    
    // Добавление нового контента
    static async addContent(type: string, data: any, metadata?: any): Promise<GameContent> {
        // Валидация и добавление
    }
    
    // Обновление контента
    static async updateContent(id: number, updates: Partial<GameContent>): Promise<void> {
        // Обновление с версионированием
    }
    
    // Аналитика использования
    static async trackUsage(contentId: number): Promise<void> {
        // Увеличение счётчика использования
    }
}
```

### 3. Admin Panel

**Новые маршруты:**
- `/admin/content` - управление контентом
- `/admin/content/[type]` - управление конкретным типом
- `/admin/analytics` - аналитика использования
- `/admin/import-export` - импорт/экспорт данных

**Компоненты админ-панели:**
- `ContentEditor.svelte` - редактор контента
- `ContentList.svelte` - список контента с фильтрацией
- `AnalyticsDashboard.svelte` - дашборд с метриками
- `BulkOperations.svelte` - массовые операции

### 4. Валидация и типизация

**Схемы валидации (Zod):**
```typescript
export const TitleSchema = z.object({
    name: z.string().min(1).max(100),
    category: z.string().optional(),
    rarity: z.enum(['common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd']),
    description: z.string().optional(),
    unlockLevel: z.number().min(1).max(1000).optional(),
    prerequisites: z.array(z.string()).optional(),
    weight: z.number().min(0).max(100).default(1),
    tags: z.array(z.string()).optional(),
    isActive: z.boolean().default(true)
});

export const ThoughtSchema = z.object({
    text: z.string().min(1).max(500),
    category: z.enum(['general', 'combat', 'discovery', 'friendship', 'absurd', 'magic', 'food', 'adventure', 'philosophical', 'weapons', 'glory', 'failure', 'weather', 'night', 'idle']),
    mood: z.enum(['positive', 'negative', 'neutral', 'absurd']).optional(),
    context: z.string().optional(),
    weight: z.number().min(0).max(100).default(1),
    isActive: z.boolean().default(true)
});
```

### 5. Система кэширования

**Redis кэширование:**
```typescript
// Кэширование по типам
const CACHE_KEYS = {
    TITLES: 'content:titles',
    THOUGHTS: 'content:thoughts',
    ITEMS: 'content:items',
    SKILLS: 'content:skills',
    CREATURES: 'content:creatures',
    LOCATIONS: 'content:locations',
};

// Автоматическое обновление кэша при изменениях
class CacheManager {
    static async invalidate(type: string): Promise<void> {
        // Инвалидация кэша для конкретного типа
    }
    
    static async warmupCache(): Promise<void> {
        // Предварительная загрузка популярного контента
    }
}
```

### 6. Импорт/Экспорт

**Инструменты для работы с данными:**
```typescript
export class ContentMigration {
    // Экспорт в JSON
    static async exportContent(type?: string): Promise<any> {
        // Экспорт в различных форматах
    }
    
    // Импорт из JSON/CSV
    static async importContent(data: any, type: string): Promise<ImportResult> {
        // Валидация и импорт
    }
    
    // Миграция с old format
    static async migrateFromHardcoded(): Promise<void> {
        // Перенос существующих данных
    }
}
```

### 7. Локализация

**Многоязычная поддержка:**
```typescript
export const translations = pgTable('translations', {
    id: serial('id').primaryKey(),
    contentType: text('content_type').notNull(),
    contentId: integer('content_id').notNull(),
    field: text('field').notNull(),
    language: text('language').notNull(),
    text: text('text').notNull(),
});

export class LocalizationService {
    static async getLocalizedContent(id: number, language: string, field: string): Promise<string> {
        // Получение локализованного текста
    }
}
```

### 8. Аналитика и метрики

**Отслеживание использования:**
```typescript
export class AnalyticsService {
    // Популярность контента
    static async getMostUsedContent(type: string, limit = 10): Promise<any[]> {
        // Топ контента по использованию
    }
    
    // Рейтинг контента от игроков
    static async rateContent(contentId: number, rating: number): Promise<void> {
        // Система рейтингов
    }
    
    // Сезонная активность
    static async getSeasonalTrends(): Promise<any> {
        // Анализ трендов
    }
}
```

## 📊 Этапы внедрения

### Этап 1: База данных (1-2 дня)
1. Создать таблицы БД для контента
2. Создать миграции
3. Написать базовые сервисы

### Этап 2: Миграция данных (1 день)
1. Перенести существующие данные в БД
2. Создать адаптеры для обратной совместимости
3. Протестировать корректность

### Этап 3: Admin Panel (3-4 дня)
1. Создать интерфейс управления
2. Реализовать CRUD операции
3. Добавить валидацию

### Этап 4: Расширенные функции (2-3 дня)
1. Аналитика и метрики
2. Импорт/Экспорт
3. Локализация

### Этап 5: Оптимизация (1-2 дня)
1. Система кэширования
2. Производительность
3. Мониторинг

## 🎯 Преимущества новой системы

1. **Динамическое управление** - без изменения кода
2. **Масштабируемость** - легко добавлять новые типы контента
3. **Аналитика** - понимание популярности контента
4. **Гибкость** - настройка вероятностей и условий
5. **Локализация** - поддержка множественных языков
6. **Безопасность** - валидация и контроль доступа
7. **Версионирование** - отслеживание изменений
8. **Массовые операции** - импорт/экспорт данных

## 💻 Файлы для создания/изменения

### Новые файлы:
- `src/lib/services/contentService.ts`
- `src/lib/services/analyticsService.ts`
- `src/lib/services/localizationService.ts`
- `src/lib/utils/contentValidators.ts`
- `src/routes/admin/` (вся директория)
- `src/lib/components/admin/` (компоненты админки)

### Изменения существующих файлов:
- `src/lib/server/db/schema.ts` - новые таблицы
- `src/lib/game/data/*` - заменить на сервисы
- `src/lib/server/eventQueue.ts` - использовать новые сервисы
- `src/routes/api/` - новые endpoints для админки

Эта система позволит превратить hard-coded игру в полноценную платформу с динамическим управлением контентом.