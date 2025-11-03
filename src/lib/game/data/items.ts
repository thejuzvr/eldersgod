// Предметы для Elder Scrolls Auto-RPG (40+ с абсурдом)
export interface GameItem {
	name: string;
	type: 'weapon' | 'armor' | 'artifact' | 'consumable';
	rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'absurd';
	stats: {
		strength?: number;
		intelligence?: number;
		luck?: number;
		health?: number;
	};
	description: string;
	icon: string;
}

export const items: GameItem[] = [
	// Оружие
	{
		name: 'Носок-телепорт',
		type: 'weapon',
		rarity: 'absurd',
		stats: { strength: 5, luck: 10 },
		description: 'Единственный носок из пары. Телепортирует врагов... в прошлое! Иногда.',
		icon: '🧦'
	},
	{
		name: 'Меч из замороженного крика',
		type: 'weapon',
		rarity: 'legendary',
		stats: { strength: 15, intelligence: 5 },
		description: 'Фус-Ро-Да превратилось в лёд. Теперь это меч. Логика!',
		icon: '⚔️'
	},
	{
		name: 'Ложка судьбы',
		type: 'weapon',
		rarity: 'epic',
		stats: { luck: 20 },
		description: 'Обычная ложка, но она знает будущее. Не делится.',
		icon: '🥄'
	},
	{
		name: 'Метла разрушения',
		type: 'weapon',
		rarity: 'rare',
		stats: { strength: 8, intelligence: 3 },
		description: 'Подметает врагов под ковёр. Буквально.',
		icon: '🧹'
	},
	{
		name: 'Сковорода правосудия',
		type: 'weapon',
		rarity: 'uncommon',
		stats: { strength: 6 },
		description: 'Ещё со сковородки, враги! И пахнет блинчиками.',
		icon: '🍳'
	},
	{
		name: 'Вилка тысячи уколов',
		type: 'weapon',
		rarity: 'rare',
		stats: { strength: 10 },
		description: 'Четыре зубца смерти. Пятый потерялся.',
		icon: '🍴'
	},
	{
		name: 'Зонтик грозы',
		type: 'weapon',
		rarity: 'epic',
		stats: { strength: 7, intelligence: 8 },
		description: 'Вызывает дождь из молний. Промокнете.',
		icon: '☂️'
	},
	
	// Броня
	{
		name: 'Медовый шлем',
		type: 'armor',
		rarity: 'rare',
		stats: { health: 20, luck: 5 },
		description: 'Пчёлы одобряют. Осы — нет. Липкий.',
		icon: '🍯'
	},
	{
		name: 'Щит полуночной сырности',
		type: 'armor',
		rarity: 'legendary',
		stats: { health: 30, intelligence: 5 },
		description: 'Сделан из лунного сыра. Драконы путают с едой.',
		icon: '🛡️'
	},
	{
		name: 'Сапоги вечного танца',
		type: 'armor',
		rarity: 'epic',
		stats: { luck: 15, strength: 5 },
		description: 'Нельзя перестать танцевать. Вообще. Помогите.',
		icon: '👢'
	},
	{
		name: 'Перчатки-невидимки (видимые)',
		type: 'armor',
		rarity: 'uncommon',
		stats: { luck: 8 },
		description: 'Невидимость не сработала. Зато тёплые!',
		icon: '🧤'
	},
	{
		name: 'Шапка мыслей',
		type: 'armor',
		rarity: 'rare',
		stats: { intelligence: 12 },
		description: 'Думает за вас. Иногда не о том.',
		icon: '🎩'
	},
	{
		name: 'Кольчуга из облаков',
		type: 'armor',
		rarity: 'absurd',
		stats: { health: 15, luck: 10 },
		description: 'Очень легкая. Очень мокрая после дождя.',
		icon: '☁️'
	},
	{
		name: 'Плащ невидимости (со скидкой)',
		type: 'armor',
		rarity: 'epic',
		stats: { luck: 18 },
		description: 'Делает невидимым только по четвергам.',
		icon: '🧥'
	},
	
	// Артефакты
	{
		name: 'Кольцо говорящих облаков',
		type: 'artifact',
		rarity: 'legendary',
		stats: { intelligence: 10, luck: 10 },
		description: 'Облака дают советы. Бесполезные, но искренние.',
		icon: '💍'
	},
	{
		name: 'Сахарная бомба',
		type: 'artifact',
		rarity: 'epic',
		stats: { strength: 20 },
		description: 'Взрывается конфетти и диабетом.',
		icon: '🍬'
	},
	{
		name: 'Амулет вечного голода',
		type: 'artifact',
		rarity: 'rare',
		stats: { health: 25, strength: -5 },
		description: 'Постоянно хочется есть. Сила воли -100%.',
		icon: '📿'
	},
	{
		name: 'Часы, идущие назад',
		type: 'artifact',
		rarity: 'absurd',
		stats: { luck: 25 },
		description: 'Время идёт назад. Вы молодеете? Нет. Просто опаздываете.',
		icon: '⏰'
	},
	{
		name: 'Компас, указывающий на завтрак',
		type: 'artifact',
		rarity: 'uncommon',
		stats: { luck: 7 },
		description: 'Всегда найдёте ближайшую таверну!',
		icon: '🧭'
	},
	{
		name: 'Свеча вечного света (5 минут)',
		type: 'artifact',
		rarity: 'common',
		stats: { intelligence: 3 },
		description: 'Вечная, но горит 5 минут. Маркетинг!',
		icon: '🕯️'
	},
	{
		name: 'Зеркало лжи',
		type: 'artifact',
		rarity: 'rare',
		stats: { intelligence: 10 },
		description: 'Показывает всё наоборот. Вы красивы!',
		icon: '🪞'
	},
	{
		name: 'Ключ от всех дверей (кроме нужной)',
		type: 'artifact',
		rarity: 'epic',
		stats: { luck: 15 },
		description: 'Открывает всё, кроме той двери, что вам нужна.',
		icon: '🔑'
	},
	{
		name: 'Флейта призыва кур',
		type: 'artifact',
		rarity: 'uncommon',
		stats: { luck: 8, intelligence: 5 },
		description: 'Призывает армию кур. Они не слушаются.',
		icon: '🎵'
	},
	{
		name: 'Книга пустых страниц (мудрости)',
		type: 'artifact',
		rarity: 'absurd',
		stats: { intelligence: 20 },
		description: 'Пустая книга. Но она заставляет задуматься!',
		icon: '📖'
	},
	{
		name: 'Мешочек бесконечных крошек',
		type: 'artifact',
		rarity: 'common',
		stats: { luck: 5 },
		description: 'Бесконечные хлебные крошки. Птицы следуют за вами.',
		icon: '👜'
	},
	
	// Расходники
	{
		name: 'Зелье левитации (вниз)',
		type: 'consumable',
		rarity: 'rare',
		stats: { luck: -10, strength: 5 },
		description: 'Вы летите! Вниз. Очень быстро.',
		icon: '🧪'
	},
	{
		name: 'Эликсир бессмертия (1 час)',
		type: 'consumable',
		rarity: 'epic',
		stats: { health: 50 },
		description: 'Бессмертие! На час. Потом очень смертен.',
		icon: '⚗️'
	},
	{
		name: 'Сладкий рулет силы',
		type: 'consumable',
		rarity: 'uncommon',
		stats: { strength: 10, health: 5 },
		description: 'Вкусный. Даёт силу. Калорийный.',
		icon: '🥐'
	},
	{
		name: 'Сыр храбрости',
		type: 'consumable',
		rarity: 'common',
		stats: { strength: 5, luck: 3 },
		description: 'Пахнет подвигами. И сыром.',
		icon: '🧀'
	},
	{
		name: 'Чай забвения',
		type: 'consumable',
		rarity: 'rare',
		stats: { intelligence: -5, luck: 15 },
		description: 'Забываете проблемы. И своё имя.',
		icon: '🍵'
	},
	{
		name: 'Печенье удачи (несъедобное)',
		type: 'consumable',
		rarity: 'uncommon',
		stats: { luck: 12 },
		description: 'Каменное. Но удача +12!',
		icon: '🍪'
	},
	{
		name: 'Суп прозрения',
		type: 'consumable',
		rarity: 'epic',
		stats: { intelligence: 15 },
		description: 'Видите будущее. Там тоже суп.',
		icon: '🍲'
	},
	
	// Особые предметы
	{
		name: 'Золотой зуб удачи',
		type: 'artifact',
		rarity: 'legendary',
		stats: { luck: 30 },
		description: 'Подарок от извинившейся лестницы.',
		icon: '🦷'
	},
	{
		name: 'Свиток "Фус-Ро-Лё"',
		type: 'artifact',
		rarity: 'absurd',
		stats: { strength: 1, intelligence: -5 },
		description: 'Почти как Фус-Ро-Да, но нет.',
		icon: '📜'
	},
	{
		name: 'Портрет облака',
		type: 'artifact',
		rarity: 'rare',
		stats: { intelligence: 8, luck: 8 },
		description: 'Нарисован героем от скуки. Облако позировало.',
		icon: '🖼️'
	},
	{
		name: 'Носок от Носка-телепорта',
		type: 'artifact',
		rarity: 'absurd',
		stats: { luck: 50 },
		description: 'Вторая половина! Вместе они... носки.',
		icon: '🧦'
	},
	{
		name: 'Джемная душа',
		type: 'artifact',
		rarity: 'epic',
		stats: { health: 20, intelligence: 10 },
		description: 'Душа кекса-дракона. Сладкая. Липкая.',
		icon: '💎'
	},
	{
		name: 'Молоток философии',
		type: 'weapon',
		rarity: 'legendary',
		stats: { strength: 18, intelligence: 18 },
		description: 'Бьёт и заставляет думать одновременно.',
		icon: '🔨'
	},
	{
		name: 'Лук без стрел (но с идеями)',
		type: 'weapon',
		rarity: 'rare',
		stats: { intelligence: 15 },
		description: 'Стрелы кончились. Остались идеи.',
		icon: '🏹'
	},
	{
		name: 'Посох танцев',
		type: 'weapon',
		rarity: 'epic',
		stats: { strength: 10, luck: 12 },
		description: 'Враги начинают танцевать. Потом дерутся.',
		icon: '🪄'
	},
	{
		name: 'Кинжал критики',
		type: 'weapon',
		rarity: 'uncommon',
		stats: { intelligence: 8, strength: 6 },
		description: 'Критикует врагов словесно, потом колет.',
		icon: '🗡️'
	}
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

