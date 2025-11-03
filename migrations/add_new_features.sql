-- Добавить поле current_location в таблицу heroes
ALTER TABLE heroes ADD COLUMN IF NOT EXISTS current_location TEXT DEFAULT 'Вайтран' NOT NULL;

-- Создать таблицу hero_quests (задания героев)
CREATE TABLE IF NOT EXISTS hero_quests (
  id SERIAL PRIMARY KEY,
  hero_id INTEGER REFERENCES heroes(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '📝',
  status TEXT DEFAULT 'active' NOT NULL,
  progress JSONB DEFAULT '{}' NOT NULL,
  subtasks JSONB NOT NULL,
  rewards JSONB,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMP
);

-- Создать таблицу hero_skills (умения героев)
CREATE TABLE IF NOT EXISTS hero_skills (
  id SERIAL PRIMARY KEY,
  hero_id INTEGER REFERENCES heroes(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT DEFAULT '📚',
  level INTEGER DEFAULT 1 NOT NULL,
  category TEXT NOT NULL,
  acquired_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Создать таблицу user_ideas (идеи пользователей)
CREATE TABLE IF NOT EXISTS user_ideas (
  id SERIAL PRIMARY KEY,
  hero_id INTEGER REFERENCES heroes(id) NOT NULL,
  category TEXT NOT NULL,
  subject TEXT,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_hero_quests_hero_id ON hero_quests(hero_id);
CREATE INDEX IF NOT EXISTS idx_hero_skills_hero_id ON hero_skills(hero_id);
CREATE INDEX IF NOT EXISTS idx_user_ideas_hero_id ON user_ideas(hero_id);
CREATE INDEX IF NOT EXISTS idx_user_ideas_status ON user_ideas(status);

-- Обновить existing записи, добавив дефолтную локацию
UPDATE heroes SET current_location = 'Вайтран' WHERE current_location IS NULL;

