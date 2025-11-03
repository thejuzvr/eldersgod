// Существа для событий в мире Elder Scrolls (с абсурдом)
export const creatures = [
	// Драконы
	{ name: 'Дракон-пчеловод', icon: '🐉', hostile: false, absurdity: 'высокая' },
	{ name: 'Кекс-дракон', icon: '🐲', hostile: true, absurdity: 'максимальная' },
	{ name: 'Дракон-философ', icon: '🐉', hostile: false, absurdity: 'высокая' },
	{ name: 'Миниатюрный дракон в шапке', icon: '🐲', hostile: false, absurdity: 'высокая' },
	{ name: 'Дракон из замороженного крика', icon: '❄️', hostile: true, absurdity: 'средняя' },
	
	// Грибы и растения
	{ name: 'Гриб-воин', icon: '🍄', hostile: true, absurdity: 'высокая' },
	{ name: 'Живой гриб', icon: '🍄', hostile: false, absurdity: 'средняя' },
	{ name: 'Королевский гриб', icon: '👑', hostile: false, absurdity: 'высокая' },
	{ name: 'Поющая капуста', icon: '🥬', hostile: false, absurdity: 'максимальная' },
	{ name: 'Танцующий папоротник', icon: '🌿', hostile: false, absurdity: 'высокая' },
	
	// Животные-философы
	{ name: 'Лошадь-философ', icon: '🐴', hostile: false, absurdity: 'высокая' },
	{ name: 'Кот-требующий-рыбку', icon: '🐱', hostile: false, absurdity: 'средняя' },
	{ name: 'Медведь-поэт', icon: '🐻', hostile: false, absurdity: 'высокая' },
	{ name: 'Волк в овечьей шкуре (буквально)', icon: '🐺', hostile: true, absurdity: 'средняя' },
	{ name: 'Краб-кузнец', icon: '🦀', hostile: false, absurdity: 'высокая' },
	
	// Ожившие предметы
	{ name: 'Ковёр-торговец', icon: '🧶', hostile: false, absurdity: 'максимальная' },
	{ name: 'Лестница с характером', icon: '🪜', hostile: true, absurdity: 'максимальная' },
	{ name: 'Говорящий камень', icon: '🪨', hostile: false, absurdity: 'высокая' },
	{ name: 'Метла с амбициями', icon: '🧹', hostile: false, absurdity: 'высокая' },
	{ name: 'Ложка судьбы', icon: '🥄', hostile: false, absurdity: 'максимальная' },
	
	// Сырные монстры
	{ name: 'Сырный голем', icon: '🧀', hostile: true, absurdity: 'высокая' },
	{ name: 'Летающий сыр', icon: '🧀', hostile: false, absurdity: 'максимальная' },
	{ name: 'Король сыров', icon: '👑', hostile: true, absurdity: 'высокая' },
	
	// Облака
	{ name: 'Облако-художник', icon: '☁️', hostile: false, absurdity: 'высокая' },
	{ name: 'Говорящее облако', icon: '☁️', hostile: false, absurdity: 'средняя' },
	{ name: 'Грозовое облако с чувством юмора', icon: '⛈️', hostile: false, absurdity: 'высокая' },
	
	// Elder Scrolls классика (но абсурдная)
	{ name: 'Двемерский автомат-официант', icon: '🤖', hostile: false, absurdity: 'высокая' },
	{ name: 'Даэдра в отпуске', icon: '👹', hostile: false, absurdity: 'высокая' },
	{ name: 'Скелет-барабанщик', icon: '💀', hostile: false, absurdity: 'средняя' },
	{ name: 'Зомби-садовник', icon: '🧟', hostile: false, absurdity: 'средняя' },
	{ name: 'Вампир-вегетарианец', icon: '🧛', hostile: false, absurdity: 'высокая' },
	
	// Насекомые
	{ name: 'Кузнечик-король', icon: '🦗', hostile: false, absurdity: 'максимальная' },
	{ name: 'Пчела-философ', icon: '🐝', hostile: false, absurdity: 'высокая' },
	{ name: 'Светящийся жук-поэт', icon: '🪲', hostile: false, absurdity: 'высокая' },
	
	// Необычные NPC
	{ name: 'Бродячий торговец носками', icon: '👤', hostile: false, absurdity: 'высокая' },
	{ name: 'Алхимик-неудачник', icon: '🧙', hostile: false, absurdity: 'средняя' },
	{ name: 'Бард без голоса', icon: '🎭', hostile: false, absurdity: 'высокая' },
	{ name: 'Стража, потерявший меч', icon: '🛡️', hostile: false, absurdity: 'средняя' },
	
	// Стихии
	{ name: 'Огонь с характером', icon: '🔥', hostile: true, absurdity: 'высокая' },
	{ name: 'Дружелюбная молния', icon: '⚡', hostile: false, absurdity: 'высокая' },
	{ name: 'Лёд, мечтающий стать водой', icon: '🧊', hostile: false, absurdity: 'максимальная' },
	
	// Еда-монстры
	{ name: 'Агрессивный хлеб', icon: '🍞', hostile: true, absurdity: 'максимальная' },
	{ name: 'Сладкий рулет-гладиатор', icon: '🥐', hostile: true, absurdity: 'максимальная' },
	{ name: 'Вишнёвый джем с амбициями', icon: '🍒', hostile: false, absurdity: 'максимальная' },
	
	// Транспорт
	{ name: 'Телега-философ', icon: '🛒', hostile: false, absurdity: 'высокая' },
	{ name: 'Лодка на ногах', icon: '⛵', hostile: false, absurdity: 'максимальная' },
	
	// Мебель
	{ name: 'Стул с мнением', icon: '🪑', hostile: false, absurdity: 'высокая' },
	{ name: 'Стол-дипломат', icon: '🪑', hostile: false, absurdity: 'высокая' },
	
	// Погода
	{ name: 'Дождь из сыров', icon: '🌧️', hostile: false, absurdity: 'максимальная' },
	{ name: 'Метель с чувством такта', icon: '❄️', hostile: false, absurdity: 'высокая' }
];

export function getRandomCreature() {
	return creatures[Math.floor(Math.random() * creatures.length)];
}

export function getCreaturesByAbsurdity(level: 'средняя' | 'высокая' | 'максимальная') {
	return creatures.filter(c => c.absurdity === level);
}

