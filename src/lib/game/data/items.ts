export interface GameItem {
  id?: string;
  name: string;
  type: 'weapon' | 'armor' | 'artifact' | 'consumable';
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'absurd';
  stats: {
    strength?: number;
    intelligence?: number;
    luck?: number;
    health?: number;
    armor?: number; // Armor Class bonus
    damageDice?: string; // e.g. "1d8"
  };
  description: string;
  icon: string;
}

export const items: GameItem[] = [
  // Серьезное оружие (Lore-friendly)
  { id: 'weapon_dagger_iron', name: 'Железный кинжал', type: 'weapon', rarity: 'common', stats: { strength: 4, damageDice: '1d4' }, description: 'Простое, но надежное оружие.', icon: '🗡️' },
  { id: 'weapon_sword_iron', name: 'Железный меч', type: 'weapon', rarity: 'common', stats: { strength: 7, damageDice: '1d8' }, description: 'Обычный меч стражника.', icon: '⚔️' },
  { id: 'weapon_sword_steel', name: 'Стальной меч', type: 'weapon', rarity: 'uncommon', stats: { strength: 8, damageDice: '1d8' }, description: 'Острый и хорошо сбалансированный.', icon: '⚔️' },
  { id: 'weapon_mace_orcish', name: 'Орочья булава', type: 'weapon', rarity: 'uncommon', stats: { strength: 11, damageDice: '1d10' }, description: 'Тяжелая и жестокая.', icon: '🔨' },
  { id: 'weapon_sword_glass', name: 'Стеклянный меч', type: 'weapon', rarity: 'rare', stats: { strength: 14, damageDice: '1d8+2' }, description: 'Легкий и невероятно острый.', icon: '🗡️' },
  { id: 'weapon_sword_ebony', name: 'Эбонитовый меч', type: 'weapon', rarity: 'legendary', stats: { strength: 16, damageDice: '1d10+2' }, description: 'Темный клинок из вулканического стекла.', icon: '🗡️' },
  { id: 'weapon_sword_daedric', name: 'Даэдрический меч', type: 'weapon', rarity: 'legendary', stats: { strength: 20, damageDice: '2d6+4' }, description: 'Оружие, пропитанное кровью даэдра.', icon: '🗡️' },

  // Серьезная броня (Lore-friendly)
  { id: 'armor_cuirass_iron', name: 'Железная броня', type: 'armor', rarity: 'common', stats: { armor: 4, health: 15 }, description: 'Тяжелая, но неплохо защищает.', icon: '🛡️' },
  { id: 'armor_cuirass_steel', name: 'Стальная броня', type: 'armor', rarity: 'uncommon', stats: { armor: 6, health: 25 }, description: 'Стандартная броня для опытных воинов.', icon: '🛡️' },
  { id: 'armor_cuirass_elven', name: 'Эльфийская броня', type: 'armor', rarity: 'rare', stats: { armor: 5, health: 20, luck: 5 }, description: 'Легкая и элегантная.', icon: '🧥' },
  { id: 'armor_cuirass_dwarven', name: 'Двемерская броня', type: 'armor', rarity: 'rare', stats: { armor: 8, health: 35 }, description: 'Тяжелые латы гномьей работы.', icon: '🛡️' },
  { id: 'armor_cuirass_dragonplate', name: 'Пластинчатая драконья броня', type: 'armor', rarity: 'legendary', stats: { armor: 12, health: 60 }, description: 'Выкована из костей драконов.', icon: '🛡️' },

  // Артефакты (Lore-friendly)
  { id: 'weapon_dawnbreaker', name: 'Рассветная Погибель', type: 'artifact', rarity: 'legendary', stats: { strength: 16, intelligence: 10, damageDice: '1d8+5' }, description: 'Святой клинок Меридии.', icon: '✨' },
  { id: 'weapon_wabbajack', name: 'Ваббаджек', type: 'artifact', rarity: 'legendary', stats: { luck: 50, damageDice: '1d100' }, description: 'Случайность в чистом виде.', icon: '🪄' },

  // Расходники (Lore-friendly)
  { id: 'potion_health_weak', name: 'Слабый эликсир здоровья', type: 'consumable', rarity: 'common', stats: { health: 25 }, description: 'Лечит мелкие раны.', icon: '🧪' },
  { id: 'potion_health_strong', name: 'Сильный эликсир здоровья', type: 'consumable', rarity: 'uncommon', stats: { health: 75 }, description: 'Спасает от тяжелых увечий.', icon: '⚗️' },
  { id: 'potion_invisibility', name: 'Эликсир невидимости', type: 'consumable', rarity: 'rare', stats: { luck: 20 }, description: 'Позволяет скрыться от врагов.', icon: '🧪' },

  // Абсурдные предметы (Юмор)
  { id: 'food_sweetroll', name: 'Сладкая булочка', type: 'consumable', rarity: 'absurd', stats: { health: 100, luck: 10 }, description: 'Кто-то украл её?', icon: '🥐' },
  { id: 'misc_arrow_in_knee', name: 'Стрела в колено', type: 'artifact', rarity: 'absurd', stats: { strength: -5, luck: 10 }, description: 'Конец карьеры искателя приключений.', icon: '🏹' },
  { id: 'misc_bucket', name: 'Ведро', type: 'armor', rarity: 'absurd', stats: { armor: 1, intelligence: -10 }, description: 'Идеально подходит для кражи.', icon: '🪣' },
  { id: 'weapon_cheese_dagger', name: 'Сырный кинжал', type: 'weapon', rarity: 'absurd', stats: { strength: 3, damageDice: '1d2' }, description: 'Остро пахнет и не очень больно режет.', icon: '🧀' }
];

export function getRandomItem() {
  return items[Math.floor(Math.random() * items.length)];
}

export function getItemsByRarity(rarity: GameItem['rarity']) {
  return items.filter(item => item.rarity === rarity);
}

export function getItemsByType(type: GameItem['type']) {
  return items.filter(item => item.type === type);
}
