// Существа для событий в мире Elder Scrolls + небольшой процент абсурда. С добавлением Armor Class (AC)
export const creatures = [
  // Серьезные враги (Lore-friendly)
  { id: 'wolf', name: 'Волк', icon: '🐺', hostile: true, absurdity: 'низкая', health: 20, armor: 11, damage: 3 },
  { id: 'frost_spider', name: 'Морозный паук', icon: '🕷️', hostile: true, absurdity: 'низкая', health: 30, armor: 12, damage: 4 },
  { id: 'bandit', name: 'Бандит', icon: '👤', hostile: true, absurdity: 'низкая', health: 40, armor: 12, damage: 5 },
  { id: 'bandit_marauder', name: 'Бандит-мародер', icon: '👤', hostile: true, absurdity: 'низкая', health: 70, armor: 14, damage: 8 },
  { id: 'draugr', name: 'Драугр', icon: '🧟', hostile: true, absurdity: 'низкая', health: 50, armor: 13, damage: 6 },
  { id: 'draugr_wight', name: 'Драугр-страж', icon: '🧟', hostile: true, absurdity: 'низкая', health: 80, armor: 15, damage: 9 },
  { id: 'draugr_overlord', name: 'Драугр-Владыка', icon: '💀', hostile: true, absurdity: 'низкая', health: 180, armor: 16, damage: 18 },
  { id: 'falmer', name: 'Фалмер', icon: '🧝', hostile: true, absurdity: 'низкая', health: 40, armor: 11, damage: 7 },
  { id: 'sabre_cat', name: 'Саблезуб', icon: '🐯', hostile: true, absurdity: 'низкая', health: 60, armor: 12, damage: 8 },
  { id: 'spriggan', name: 'Озлобленный спригган', icon: '🌳', hostile: true, absurdity: 'низкая', health: 45, armor: 10, damage: 6 },
  { id: 'vampire_thrall', name: 'Прислужник вампира', icon: '🧛', hostile: true, absurdity: 'низкая', health: 55, armor: 12, damage: 7 },
  { id: 'vampire_master', name: 'Повелитель вампиров', icon: '🧛', hostile: true, absurdity: 'низкая', health: 110, armor: 15, damage: 14 },
  { id: 'werewolf', name: 'Оборотень', icon: '🐺', hostile: true, absurdity: 'низкая', health: 95, armor: 14, damage: 13 },
  { id: 'ice_wraith', name: 'Ледяное привидение', icon: '👻', hostile: true, absurdity: 'низкая', health: 70, armor: 13, damage: 10 },
  { id: 'necromancer', name: 'Некромант', icon: '🧙', hostile: true, absurdity: 'низкая', health: 55, armor: 11, damage: 7 },
  { id: 'mudcrab', name: 'Грязекраб', icon: '🦀', hostile: true, absurdity: 'низкая', health: 15, armor: 12, damage: 2 },
  { id: 'dragon', name: 'Дракон', icon: '🐉', hostile: true, absurdity: 'низкая', health: 250, armor: 18, damage: 25 },

  // Нейтральные NPC (Lore-friendly)
  { id: 'hunter', name: 'Охотник', icon: '🏹', hostile: false, absurdity: 'низкая', health: 30, armor: 11, damage: 4 },
  { id: 'traveling_merchant', name: 'Странствующий торговец', icon: '💰', hostile: false, absurdity: 'низкая', health: 20, armor: 10, damage: 2 },
  { id: 'maiq_the_liar', name: "М'Айк Лжец", icon: '🐱', hostile: false, absurdity: 'низкая', health: 100, armor: 15, damage: 1 },
  { id: 'pilgrim', name: 'Паломник', icon: '🚶', hostile: false, absurdity: 'низкая', health: 20, armor: 10, damage: 1 },

  // Абсурдные существа (ограниченное количество для юмора)
  { id: 'sweet_roll_thief', name: 'Похититель сладких рулетов', icon: '🏃', hostile: true, absurdity: 'высокая', health: 25, armor: 10, damage: 2 },
  { id: 'cheese_golem', name: 'Сырный голем', icon: '🧀', hostile: true, absurdity: 'максимальная', health: 40, armor: 10, damage: 3 },
  { id: 'cupcake_dragon', name: 'Кекс-дракон', icon: '🐲', hostile: true, absurdity: 'максимальная', health: 100, armor: 12, damage: 8 },
  { id: 'angry_chicken', name: 'Разъярённая курица', icon: '🐔', hostile: true, absurdity: 'высокая', health: 5, armor: 5, damage: 1 }
];

export function getRandomCreature() {
  return creatures[Math.floor(Math.random() * creatures.length)];
}

export function getRandomHostileCreature() {
  const hostiles = creatures.filter(c => c.hostile);
  return hostiles[Math.floor(Math.random() * hostiles.length)];
}

export function getCreaturesByAbsurdity(level: 'низкая' | 'средняя' | 'высокая' | 'максимальная') {
  return creatures.filter(c => c.absurdity === level);
}
