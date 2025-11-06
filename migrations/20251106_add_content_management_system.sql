-- Создание таблиц для системы управления контентом
-- Дата: 2025-11-06
-- Описание: Добавление новых таблиц для динамического управления игровым контентом

-- ========== CONTENT MANAGEMENT TABLES ==========

-- Универсальная таблица для игрового контента
CREATE TABLE game_content (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- 'title', 'thought', 'skill', 'item', 'creature', 'location', 'action'
    category TEXT, -- Подкатегория (например, 'combat', 'absurd' для thoughts)
    name TEXT, -- Для титулов, навыков, предметов
    text TEXT, -- Для мыслей, описаний
    data JSONB NOT NULL, -- Основные данные в JSON (stats, description, etc.)
    metadata JSONB, -- Дополнительная информация (tags, rarity, etc.)
    rarity TEXT, -- Для предметов/умений: common, uncommon, rare, epic, legendary, absurd
    is_active BOOLEAN DEFAULT true NOT NULL,
    weight INTEGER DEFAULT 1, -- Вес при случайном выборе
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by INTEGER REFERENCES users(id),
    tags TEXT[], -- Массив тегов для поиска и группировки
    unlock_level INTEGER DEFAULT 1, -- Уровень для разблокировки
    icon TEXT DEFAULT '✨', -- Unicode иконка
    color TEXT DEFAULT '#ffffff' -- Цвет для UI
);

-- Категории контента
CREATE TABLE content_categories (
    id SERIAL PRIMARY KEY,
    type TEXT NOT NULL, -- Тип контента (title, thought, item, etc.)
    name TEXT NOT NULL, -- Название категории
    slug TEXT NOT NULL, -- URL-friendly название
    description TEXT, -- Описание категории
    icon TEXT DEFAULT '📁', -- Иконка категории
    color TEXT DEFAULT '#666666', -- Цвет категории
    is_active BOOLEAN DEFAULT true NOT NULL,
    sort_order INTEGER DEFAULT 0, -- Порядок сортировки
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Аналитика использования контента
CREATE TABLE content_analytics (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES game_content(id) NOT NULL,
    used_count INTEGER DEFAULT 0 NOT NULL, -- Сколько раз использован
    last_used TIMESTAMP WITH TIME ZONE, -- Последнее использование
    user_ratings JSONB DEFAULT '{}', -- {userId: rating} рейтинги пользователей
    average_rating DECIMAL(3,2) DEFAULT '0.00', -- Средний рейтинг
    total_revenue INTEGER DEFAULT 0, -- Если контент приносит доход
    views INTEGER DEFAULT 0, -- Количество просмотров
    shares INTEGER DEFAULT 0, -- Количество репостов
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Версионирование контента
CREATE TABLE content_versions (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES game_content(id) NOT NULL,
    version INTEGER NOT NULL, -- Номер версии
    data JSONB NOT NULL, -- Данные версии
    change_log TEXT, -- Описание изменений
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by INTEGER REFERENCES users(id),
    is_active BOOLEAN DEFAULT false NOT NULL
);

-- Локализация контента
CREATE TABLE content_translations (
    id SERIAL PRIMARY KEY,
    content_id INTEGER REFERENCES game_content(id) NOT NULL,
    field TEXT NOT NULL, -- Какое поле переводить (name, text, description, etc.)
    language TEXT NOT NULL, -- Код языка (ru, en, fr, etc.)
    text TEXT NOT NULL, -- Переведённый текст
    is_approved BOOLEAN DEFAULT false NOT NULL, -- Одобрен ли перевод
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
    created_by INTEGER REFERENCES users(id)
);

-- Связи между контентом
CREATE TABLE content_relations (
    id SERIAL PRIMARY KEY,
    parent_id INTEGER REFERENCES game_content(id) NOT NULL,
    child_id INTEGER REFERENCES game_content(id) NOT NULL,
    relation_type TEXT NOT NULL, -- 'depends_on', 'conflicts_with', 'combo_with', 'prerequisite_for'
    metadata JSONB, -- Дополнительные данные о связи
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- ========== INDEXES ==========

-- Индексы для производительности
CREATE INDEX idx_game_content_type ON game_content(type);
CREATE INDEX idx_game_content_category ON game_content(category);
CREATE INDEX idx_game_content_active ON game_content(is_active);
CREATE INDEX idx_game_content_weight ON game_content(weight);
CREATE INDEX idx_game_content_tags ON game_content USING GIN(tags);
CREATE INDEX idx_game_content_created_by ON game_content(created_by);

CREATE INDEX idx_content_analytics_content_id ON content_analytics(content_id);
CREATE INDEX idx_content_analytics_used_count ON content_analytics(used_count);
CREATE INDEX idx_content_analytics_last_used ON content_analytics(last_used);

CREATE INDEX idx_content_versions_content_id ON content_versions(content_id);
CREATE INDEX idx_content_versions_active ON content_versions(is_active);

CREATE INDEX idx_content_translations_content_id ON content_translations(content_id);
CREATE INDEX idx_content_translations_language ON content_translations(language);

CREATE INDEX idx_content_relations_parent_id ON content_relations(parent_id);
CREATE INDEX idx_content_relations_child_id ON content_relations(child_id);
CREATE INDEX idx_content_relations_type ON content_relations(relation_type);

-- ========== CONSTRAINTS ==========

-- Уникальные ограничения
CREATE UNIQUE INDEX unique_content_slug ON content_categories(type, slug);
CREATE UNIQUE INDEX unique_content_translation ON content_translations(content_id, field, language);
CREATE UNIQUE INDEX unique_content_relation ON content_relations(parent_id, child_id, relation_type);

-- Проверочные ограничения
ALTER TABLE game_content ADD CONSTRAINT check_rarity 
    CHECK (rarity IS NULL OR rarity IN ('common', 'uncommon', 'rare', 'epic', 'legendary', 'absurd'));

ALTER TABLE game_content ADD CONSTRAINT check_weight 
    CHECK (weight >= 0);

ALTER TABLE game_content ADD CONSTRAINT check_unlock_level 
    CHECK (unlock_level >= 1);

ALTER TABLE content_analytics ADD CONSTRAINT check_average_rating 
    CHECK (average_rating >= 0 AND average_rating <= 5);

-- ========== TRIGGERS ==========

-- Функция для обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER update_game_content_updated_at 
    BEFORE UPDATE ON game_content 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_analytics_updated_at 
    BEFORE UPDATE ON content_analytics 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========== ПОПУЛЯРНЫЕ КАТЕГОРИИ ПО УМОЛЧАНИЮ ==========

-- Добавление базовых категорий
INSERT INTO content_categories (type, name, slug, description, icon, sort_order) VALUES
-- Категории титулов
('title', 'Благородные титулы', 'noble', 'Благородные но абсурдные титулы', '👑', 1),
('title', 'Героические титулы', 'heroic', 'Титулы за героические подвиги', '⚔️', 2),
('title', 'Профессиональные титулы', 'professional', 'Титулы за профессиональные навыки', '📚', 3),
('title', 'Мистические титулы', 'mystical', 'Мистические и магические титулы', '✨', 4),
('title', 'Кулинарные титулы', 'culinary', 'Титулы связанные с едой', '🍳', 5),
('title', 'Странные титулы', 'strange', 'Странные и абсурдные титулы', '🤔', 6),

-- Категории мыслей
('thought', 'Общие мысли', 'general', 'Общие размышления героя', '💭', 1),
('thought', 'Боевые мысли', 'combat', 'Мысли во время боя', '⚔️', 2),
('thought', 'Философские мысли', 'philosophical', 'Глубокие размышления', '🧠', 3),
('thought', 'Абсурдные мысли', 'absurd', 'Совершенно безумные мысли', '🤪', 4),
('thought', 'Мысли о еде', 'food', 'Размышления о еде и напитках', '🍽️', 5),
('thought', 'Мысли в бездействии', 'idle', 'Мысли когда ничего не происходит', '😴', 6),

-- Категории умений
('skill', 'Боевые умения', 'combat', 'Умения для сражений', '⚔️', 1),
('skill', 'Магические умения', 'magic', 'Магические способности', '🪄', 2),
('skill', 'Скрытность', 'stealth', 'Умения скрытности и обмана', '👤', 3),
('skill', 'Социальные умения', 'social', 'Умения общения', '🤝', 4),
('skill', 'Абсурдные умения', 'absurd', 'Совершенно необычные умения', '🤪', 5),

-- Категории предметов
('item', 'Оружие', 'weapon', 'Различные виды оружия', '⚔️', 1),
('item', 'Броня', 'armor', 'Защитная экипировка', '🛡️', 2),
('item', 'Артефакты', 'artifact', 'Магические артефакты', '💎', 3),
('item', 'Расходники', 'consumable', 'Предметы для использования', '🧪', 4),

-- Категории существ
('creature', 'Драконы', 'dragon', 'Различные виды драконов', '🐉', 1),
('creature', 'Грибы и растения', 'plant', 'Растительные существа', '🍄', 2),
('creature', 'Животные', 'animal', 'Животные-философы', '🐴', 3),
('creature', 'Ожившие предметы', 'object', 'Ожившие неодушевлённые предметы', '🪑', 4),
('creature', 'Монстры', 'monster', 'Враждебные существа', '👹', 5),

-- Категории локаций
('location', 'Скайрим', 'skyrim', 'Локации из Скайрима', '🏔️', 1),
('location', 'Морровинд', 'morrowind', 'Локации из Морровинда', '🏜️', 2),
('location', 'Сиродиил', 'cyrodiil', 'Локации из Сиродиила', '🏛️', 3),
('location', 'Особые места', 'special', 'Уникальные и странные места', '✨', 4);

-- ========== ИНИЦИАЛИЗАЦИЯ АНАЛИТИКИ ==========

-- Создание аналитических записей для всех существующих элементов контента
INSERT INTO content_analytics (content_id, used_count, last_used)
SELECT id, 0, NULL FROM game_content;

-- ========== PERMISSIONS (для production) ==========

-- В production нужно будет добавить соответствующие права доступа
-- GRANT SELECT, INSERT, UPDATE, DELETE ON game_content TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON content_categories TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON content_analytics TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON content_versions TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON content_translations TO your_app_user;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON content_relations TO your_app_user;

-- ========== КОММЕНТАРИИ ==========

COMMENT ON TABLE game_content IS 'Универсальная таблица для хранения всего игрового контента';
COMMENT ON TABLE content_categories IS 'Категории для группировки контента';
COMMENT ON TABLE content_analytics IS 'Аналитика использования контента';
COMMENT ON TABLE content_versions IS 'Версионирование контента для отслеживания изменений';
COMMENT ON TABLE content_translations IS 'Многоязычная поддержка контента';
COMMENT ON TABLE content_relations IS 'Связи между элементами контента (зависимости, конфликты, комбинации)';

COMMENT ON COLUMN game_content.type IS 'Тип контента: title, thought, skill, item, creature, location, action';
COMMENT ON COLUMN game_content.data IS 'JSON объект с основными данными контента';
COMMENT ON COLUMN game_content.metadata IS 'JSON объект с дополнительной информацией';
COMMENT ON COLUMN game_content.weight IS 'Вес для случайного выбора (больше = чаще выбирается)';
COMMENT ON COLUMN game_content.unlock_level IS 'Уровень игрока, необходимый для разблокировки контента';
COMMENT ON COLUMN game_content.tags IS 'Массив тегов для поиска и фильтрации';