// Локации Elder Scrolls с абсурдными искажениями
export const locations = [
	// Скайрим
	{ name: 'Вайтран', description: 'Город, где все драконы на диете', region: 'Skyrim' },
	{ name: 'Рифтен', description: 'Город воров, которые крадут только носки', region: 'Skyrim' },
	{ name: 'Солитьюд', description: 'Столица одиночества и сыра', region: 'Skyrim' },
	{ name: 'Виндхельм', description: 'Холодный город горячих споров', region: 'Skyrim' },
	{ name: 'Маркарт', description: 'Город, построенный из вопросов', region: 'Skyrim' },
	
	// Морровинд
	{ name: 'Вивек', description: 'Город бога, который ушёл за молоком', region: 'Morrowind' },
	{ name: 'Балмора', description: 'Грибной город с характером', region: 'Morrowind' },
	{ name: 'Альд-Рун', description: 'Город под грибом-гигантом (он живой)', region: 'Morrowind' },
	
	// Сиродиил
	{ name: 'Имперский Город', description: 'Столица бюрократии и сладких рулетов', region: 'Cyrodiil' },
	{ name: 'Бравил', description: 'Город честных воров', region: 'Cyrodiil' },
	{ name: 'Анвил', description: 'Портовый город летающих рыб', region: 'Cyrodiil' },
	
	// Необычные места
	{ name: 'Колодец с драконом', description: 'Обычный колодец, но там дракон-пчеловод', region: 'Unknown' },
	{ name: 'Пещера говорящих камней', description: 'Камни дают советы. Плохие.', region: 'Unknown' },
	{ name: 'Таверна "У мёртвого барда"', description: 'Бард жив, но играет ужасно', region: 'Unknown' },
	{ name: 'Лес танцующих папоротников', description: 'Папоротники танцуют. Ритм отсутствует.', region: 'Unknown' },
	{ name: 'Гора вечного сыра', description: 'Сделана из сыра. Драконы счастливы.', region: 'Unknown' },
	{ name: 'Долина философских лошадей', description: 'Лошади обсуждают смысл жизни', region: 'Unknown' },
	{ name: 'Мост между вчера и завтра', description: 'Сегодня на ремонте', region: 'Unknown' },
	{ name: 'Башня обратного времени', description: 'Входишь старым, выходишь... тоже старым', region: 'Unknown' },
	{ name: 'Рынок абсурда', description: 'Продают идеи, мечты и носки', region: 'Unknown' },
	{ name: 'Библиотека пустых книг', description: 'Книги пусты, но очень мудры', region: 'Unknown' },
	{ name: 'Сад облаков', description: 'Облака растут как цветы', region: 'Unknown' },
	{ name: 'Замок из карт (каменных)', description: 'Карты превратились в камень. Магия!', region: 'Unknown' },
	{ name: 'Озеро зеркальной лжи', description: 'Отражает всё наоборот', region: 'Unknown' },
	{ name: 'Пустыня снега', description: 'Снег горячий. Физика сломана.', region: 'Unknown' },
	{ name: 'Город грибов (они правят)', description: 'Грибная демократия работает!', region: 'Unknown' },
	{ name: 'Королевство кексов', description: 'Кекс-дракон - король', region: 'Unknown' },
	{ name: 'Подземелье вечного завтрака', description: 'Завтрак длится вечность. Вкусно!', region: 'Unknown' },
	{ name: 'Храм спящего бога', description: 'Бог спит. Храпит. Громко.', region: 'Unknown' }
];

export function getRandomLocation() {
	return locations[Math.floor(Math.random() * locations.length)];
}

export function getLocationsByRegion(region: string) {
	return locations.filter(loc => loc.region === region);
}

