import { getRandomCreature, getRandomHostileCreature } from './data/creatures';
import { getRandomItem } from './data/items';
import { getRandomAction } from './data/actions';
import { getRandomLocation } from './data/locations';
import { getRandomThought } from './data/thoughts';
import { getRandomSkill } from './data/skills';
import type { Hero } from '$lib/server/db/schema';
import type { EventCategory } from '$lib/stores/gameStore';

export interface GameEvent {
  type: 'combat' | 'exploration' | 'social' | 'absurd' | 'death' | 'idle' | 'levelup' | 'noise' | 'skill';
  category: EventCategory;
  title: string;
  description: string;
  thought: string;
  location?: string;
  healthChange?: number;
  rewards?: {
    exp?: number;
    gold?: number;
    dragonSouls?: number;
    health?: number;
    item?: any;
    newTitle?: string;
    skill?: any;
  };
  interactive?: boolean;
  icon?: string;
}

// Утилитная функция для броска D20
function rollD20(): number {
  return Math.floor(Math.random() * 20) + 1;
}

// Расчет защиты (AC) героя
function calculateHeroAC(hero: any): number {
  const levelBonus = Math.floor((hero.level || 1) / 10);
  return 10 + levelBonus;
}

// Простейшее дерево поведения героя (Behavior Tree)
// Возвращает предпочитаемый тип события на основе состояния героя
function determineHeroState(hero: any): keyof typeof eventTemplates {
  const healthPercentage = hero.maxHealth ? (hero.currentHealth / hero.maxHealth) : 1;

  if (healthPercentage < 0.3) {
    // Герой ранен, ищет отдых или социальное взаимодействие
    return Math.random() > 0.5 ? 'idle' : 'social';
  } else if (healthPercentage > 0.8) {
    // Герой полон сил, ищет битву
    return Math.random() > 0.3 ? 'combat' : 'exploration';
  } else {
    // Обычное состояние, чаще исследует
    return 'exploration';
  }
}

// Шаблоны событий
const eventTemplates = {
  combat: [
    {
      weight: 30, // D20 Combat Event
      generate: (hero: any) => {
        const creature = getRandomHostileCreature();
        const location = getRandomLocation();
        const heroAC = calculateHeroAC(hero);

        let title = `Битва с ${creature.name}`;
        let description = '';
        let healthChange = 0;
        let rewards: GameEvent["rewards"] = { exp: 0, gold: 0 };
        let category: EventCategory = 'in_combat';
        let thought = getRandomThought('in_combat', hero.name);

        const roll = rollD20();
        const isCritHit = roll === 20;
        const isCritMiss = roll === 1;

        if (isCritHit) {
          description = `[Бросок D20: 20 - Критическое попадание!] ${hero.name} наносит сокрушительный удар по ${creature.name} в ${location.name}. Враг повержен мгновенно!`;
          rewards.exp = Math.floor(Math.random() * 50) + 50;
          rewards.gold = Math.floor(Math.random() * 20) + 10;
          if (Math.random() > 0.7) {
            rewards.item = getRandomItem();
            description += ` В добыче найден предмет: ${rewards.item?.name}.`;
          }
        } else if (isCritMiss) {
          const selfDamage = Math.floor(Math.random() * 10) + 5;
          description = `[Бросок D20: 1 - Критическая неудача!] ${hero.name} спотыкается во время атаки на ${creature.name} и ранит себя, теряя ${selfDamage} здоровья.`;
          healthChange = -selfDamage;
          category = 'danger';
        } else if (roll >= creature.armor) {
          description = `[Бросок D20: ${roll} против AC ${creature.armor} - Попадание!] ${hero.name} успешно атакует ${creature.name} в ${location.name} и одерживает победу.`;
          rewards.exp = Math.floor(Math.random() * 30) + 20;
          rewards.gold = Math.floor(Math.random() * 10) + 5;
        } else {
          const enemyDamage = creature.damage || (Math.floor(Math.random() * 10) + 5);
          description = `[Бросок D20: ${roll} против AC ${creature.armor} - Промах!] ${hero.name} не пробивает броню ${creature.name}. Враг контратакует, нанося ${enemyDamage} урона!`;
          healthChange = -enemyDamage;
          category = 'danger';
        }

        return {
          type: 'combat' as const,
          category,
          title,
          description,
          thought,
          location: location.name,
          healthChange,
          rewards,
          icon: creature.icon
        };
      }
    }
  ],

  exploration: [
    {
      weight: 12,
      generate: (hero: any) => {
        const location = getRandomLocation();
        const item = getRandomItem();

        return {
          type: 'exploration' as const,
          category: 'exploration' as const,
          title: `Исследование: ${location.name}`,
          description: `${hero.name} прибыл в ${location.name}. ${location.description} В пути найден предмет: ${item.name}!`,
          thought: getRandomThought('generic_neutral', hero.name),
          rewards: {
            exp: Math.floor(Math.random() * 60) + 30,
            gold: Math.floor(Math.random() * 40) + 20,
            item: item
          },
          icon: '🗺️'
        };
      }
    },
    {
      weight: 8,
      generate: (hero: any) => {
        const location = getRandomLocation();

        return {
          type: 'exploration' as const,
          category: 'exploration' as const,
          title: `Таверна в ${location.name}`,
          description: `${hero.name} решает отдохнуть в местной таверне. Теплый очаг и кружка эля восстанавливают силы.`,
          thought: getRandomThought('generic_happy', hero.name),
          rewards: {
            exp: 40,
            gold: -10,
            health: 30
          },
          icon: '🍺'
        };
      }
    }
  ],

  social: [
    {
      weight: 10,
      generate: (hero: any) => {
        const creature = getRandomCreature();
        const action = getRandomAction('social');

        return {
          type: 'social' as const,
          category: 'social' as const,
          title: `Встреча на дороге`,
          description: `${hero.name} ${action} ${creature.name}. Обменявшись парой слов, они расходятся своими путями.`,
          thought: getRandomThought('traveling', hero.name),
          rewards: {
            exp: 30,
            gold: Math.floor(Math.random() * 15)
          },
          icon: creature.icon || '💬'
        };
      }
    }
  ],

  skill: [
    {
      weight: 10,
      generate: (hero: any) => {
        const location = getRandomLocation();
        const skill = getRandomSkill();
        const isWordOfPower = Math.random() > 0.5;

        let title, description, thought, icon;

        const rarities = ['обычное', 'редкое', 'легендарное'];
        const rarity = rarities[Math.floor(Math.random() * rarities.length)];

        if (isWordOfPower) {
          title = `Слово Силы: ${skill.name}`;
          description = `В древних руинах ${location.name} ${hero.name} находит стену драконьих слов. Вспышка света, и знание впитывается в разум. Изучено ${rarity} умение: ${skill.name} (${skill.description}).`;
          thought = getRandomThought('generic_happy', hero.name);
          icon = '🪨';
        } else {
          title = `Древняя книга: ${skill.name}`;
          description = `Среди пыльных полок в заброшенной башне ${location.name} ${hero.name} находит странный фолиант. Прочитав его, герой осваивает ${rarity} умение: ${skill.name} (${skill.description}).`;
          thought = getRandomThought('generic_neutral', hero.name);
          icon = '📚';
        }

        return {
          type: 'skill' as const,
          category: 'reward' as const,
          title,
          description,
          thought,
          rewards: {
            exp: 100,
            skill: { ...skill, rarity }
          },
          icon
        };
      }
    }
  ],

  absurd: [
    {
      weight: 15,
      generate: (hero: any) => {
        const location = getRandomLocation();
        return {
          type: 'absurd' as const,
          category: 'event' as const,
          title: `Сладкая находка`,
          description: `Прямо посреди дороги в ${location.name} ${hero.name} находит идеально сохранившийся сладкий рулет. Кто-то украл его и обронил?`,
          thought: getRandomThought('absurd', hero.name),
          rewards: {
            exp: 50,
            health: 20
          },
          icon: '🥐'
        };
      }
    }
  ],

  idle: [
    {
      weight: 10,
      generate: (hero: any) => {
        return {
          type: 'idle' as const,
          category: 'rest' as const,
          title: `Привал`,
          description: `${hero.name} разбил небольшой лагерь, чтобы перевести дух, залечить раны и насладиться пейзажами Скайрима.`,
          thought: getRandomThought('generic_neutral', hero.name),
          rewards: {
            exp: 10,
            health: 25
          },
          icon: '🏕️'
        };
      }
    }
  ],

  noise: [
    {
      weight: 10,
      generate: (hero: any) => {
        const noises = [
          "Ветер завывает в ветвях деревьев.",
          "Где-то вдалеке слышен вой волка.",
          "Хрустнула ветка под ногой. Ничего страшного.",
          "Начинает моросить легкий дождь.",
          "Герой поправляет лямку рюкзака.",
          "Вдалеке пролетает одинокий ворон."
        ];
        const noise = noises[Math.floor(Math.random() * noises.length)];

        return {
          type: 'noise' as const,
          category: 'event' as const,
          title: `Путь продолжается`,
          description: noise,
          thought: getRandomThought('traveling', hero.name),
          icon: '🍃'
        };
      }
    }
  ]
};

/**
 * Генерировать случайное событие с учетом состояния героя (AI)
 */
export async function generateEvent(hero: any): Promise<GameEvent> {
  // Вероятность 30% сгенерировать "Шум", чтобы оживить лог
  if (Math.random() < 0.3) {
    return eventTemplates.noise[0].generate(hero);
  }

  // AI решает, какое событие предпочтительнее в данный момент
  const preferredType = determineHeroState(hero);

  // Определяем вес каждого типа события с уклоном в предпочтение AI
  const weights: Record<string, number> = {
    combat: preferredType === 'combat' ? 60 : 20,
    exploration: preferredType === 'exploration' ? 50 : 20,
    social: preferredType === 'social' ? 40 : 15,
    absurd: 5,
    idle: preferredType === 'idle' ? 50 : 5,
    skill: 15,
    noise: 0 // Шум обрабатывается отдельно
  };

  // Выбираем тип события
  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  let selectedType = 'exploration';

  for (const [type, weight] of Object.entries(weights)) {
    random -= weight;
    if (random <= 0) {
      selectedType = type;
      break;
    }
  }

  // Получаем шаблоны для выбранного типа
  // @ts-ignore
  const templates = eventTemplates[selectedType];
  if (!templates || templates.length === 0) {
    selectedType = 'exploration'; // fallback
  }

  // Выбираем конкретный шаблон по весу
  // @ts-ignore
  const templateTotalWeight = eventTemplates[selectedType].reduce((sum, t) => sum + t.weight, 0);
  random = Math.random() * templateTotalWeight;

  // @ts-ignore
  let selectedTemplate = eventTemplates[selectedType][0];
  // @ts-ignore
  for (const template of eventTemplates[selectedType]) {
    random -= template.weight;
    if (random <= 0) {
      selectedTemplate = template;
      break;
    }
  }

  // Генерируем событие
  return selectedTemplate.generate(hero);
}

/**
 * Генерировать idle событие (когда игрок не активен)
 */
export function generateIdleEvent(hero: any, idleTime: number): GameEvent {
  return eventTemplates.idle[0].generate(hero);
}
