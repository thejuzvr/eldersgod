import { getRandomCreature } from './data/creatures';
import { getRandomItem } from './data/items';
import { getRandomAction } from './data/actions';
import { getRandomLocation } from './data/locations';
import { getRandomTitle } from './data/titles';
import { getRandomThought } from './data/thoughts';
import type { Hero } from '$lib/server/db/schema';
import type { EventCategory } from '$lib/stores/gameStore';

export interface GameEvent {
	type: 'combat' | 'exploration' | 'social' | 'absurd' | 'death' | 'idle' | 'levelup';
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
	};
	interactive?: boolean;
	icon?: string;
}

// Функция для установки категории по типу события
function getCategoryByType(type: string): EventCategory {
	switch (type) {
		case 'combat': return 'in_combat';
		case 'exploration': return 'exploration';
		case 'social': return 'social';
		case 'absurd': return 'event';
		case 'death': return 'danger';
		case 'idle': return 'rest';
		case 'levelup': return 'reward';
		default: return 'event';
	}
}

// Шаблоны событий
const eventTemplates = {
	combat: [
		{
			weight: 10,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				const item = getRandomItem();
				const action = getRandomAction('combat');
				const location = getRandomLocation();
				const damage = Math.floor(Math.random() * 20) + 5; // Урон от 5 до 25
				
				return {
					type: 'combat' as const,
					category: 'in_combat' as EventCategory,
					title: `Битва с ${creature.name}`,
					description: `${hero.name} ${action} ${creature.name} в ${location.name}! После эпической битвы герой победил и получил ${item.name}!`,
					thought: getRandomThought('combat'),
					location: location.name,
					healthChange: -damage,
					rewards: {
						exp: Math.floor(Math.random() * 100) + 50,
						gold: Math.floor(Math.random() * 50) + 25,
						item: item
					},
					icon: creature.icon
				};
			}
		},
		{
			weight: 8,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				
				return {
					type: 'combat' as const,
					title: `Поражение от ${creature.name}`,
					description: `${creature.name} оказался сильнее! ${hero.name} героически отступил, потеряв немного достоинства и золота.`,
					thought: getRandomThought('failure'),
					rewards: {
						exp: Math.floor(Math.random() * 20) + 10,
						gold: -Math.floor(Math.random() * 30) - 10,
						health: -Math.floor(Math.random() * 20) - 10
					},
					icon: creature.icon
				};
			}
		},
		{
			weight: 15,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				const location = getRandomLocation();
				
				return {
					type: 'combat' as const,
					title: `Кекс-дракон атакует!`,
					description: `В ${location.name} появился Кекс-дракон! ${hero.name} сразился с ним, используя силу абсурда. Кекс повержен! Теперь у героя есть Джемная душа!`,
					thought: `О Великий! Этот кекс кричал: "Я — король крема!" и плюётся вишнёвым джемом!`,
					rewards: {
						exp: 300,
						gold: 100,
						dragonSouls: 1,
						item: { name: 'Джемная душа', icon: '💎', type: 'artifact' }
					},
					interactive: true,
					icon: '🐲'
				};
			}
		},
		{
			weight: 7,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				
				return {
					type: 'combat' as const,
					title: `Агрессивный хлеб!`,
					description: `${hero.name} встретил агрессивный хлеб! Битва была жестокой. Герой победил, но теперь боится пекарен.`,
					thought: 'Хлеб... живой... Мир никогда не будет прежним.',
					rewards: {
						exp: 80,
						gold: 40,
						item: getRandomItem()
					},
					icon: '🍞'
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
					title: `Исследование ${location.name}`,
					description: `${hero.name} исследовал ${location.name}. ${location.description} В пути герой нашёл ${item.name}!`,
					thought: getRandomThought('discovery'),
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
			weight: 10,
			generate: (hero: any) => {
				const location = getRandomLocation();
				
				return {
					type: 'exploration' as const,
					title: `Упал в колодец`,
					description: `${hero.name} упал в колодец в ${location.name}, но обнаружил там дракона-пчеловода! Теперь герой носит медовый шлем и кричит: "Спасибо, Великий!"`,
					thought: 'О Великий! Дракон в колодце делает мёд! Логично!',
					rewards: {
						exp: 150,
						gold: 60,
						item: { name: 'Медовый шлем', icon: '🍯', type: 'armor' }
					},
					icon: '🐉'
				};
			}
		},
		{
			weight: 8,
			generate: (hero: any) => {
				const location = getRandomLocation();
				
				return {
					type: 'exploration' as const,
					title: `Пещера говорящих камней`,
					description: `В ${location.name} ${hero.name} нашёл пещеру с говорящими камнями. Они дали советы... бесполезные, но искренние!`,
					thought: getRandomThought('philosophical'),
					rewards: {
						exp: 100,
						gold: 50,
						intelligence: 5
					},
					icon: '🪨'
				};
			}
		},
		{
			weight: 6,
			generate: (hero: any) => {
				return {
					type: 'exploration' as const,
					title: `Лестница с характером`,
					description: `${hero.name} встретил лестницу с характером. Лестница была груба, толкнула героя, но потом извинилась и подарила золотой зуб!`,
					thought: 'Лестница... извинилась... Я видел всё.',
					rewards: {
						exp: 120,
						gold: 80,
						item: { name: 'Золотой зуб удачи', icon: '🦷', type: 'artifact' }
					},
					icon: '🪜'
				};
			}
		},
		{
			weight: 9,
			generate: (hero: any) => {
				const location = getRandomLocation();
				
				return {
					type: 'exploration' as const,
					title: `Таверна найдена!`,
					description: `${hero.name} нашёл таверну "${location.name}"! Сладкие рулеты, эль и странные истории - что ещё нужно герою?`,
					thought: getRandomThought('food'),
					rewards: {
						exp: 40,
						gold: -20, // потратил на еду
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
					title: `Встреча с ${creature.name}`,
					description: `${hero.name} ${action} ${creature.name}. Завели интересный разговор о смысле жизни и сыре.`,
					thought: getRandomThought('friendship'),
					rewards: {
						exp: 60,
						gold: Math.floor(Math.random() * 30)
					},
					icon: creature.icon
				};
			}
		},
		{
			weight: 8,
			generate: (hero: any) => {
				return {
					type: 'social' as const,
					title: `Ковёр-торговец`,
					description: `${hero.name} встретил ковра-торговца! Ковёр предложил сделку: душу за носок. Герой отказался, но получил скидку.`,
					thought: 'Ковёр разговаривает! И цены разумные!',
					rewards: {
						exp: 70,
						gold: -30,
						item: getRandomItem()
					},
					icon: '🧶'
				};
			}
		},
		{
			weight: 7,
			generate: (hero: any) => {
				return {
					type: 'social' as const,
					title: `Философская беседа с лошадью`,
					description: `Лошадь-философ поделилась мудростью: "Сено - это смысл". ${hero.name} задумался.`,
					thought: getRandomThought('philosophical'),
					rewards: {
						exp: 90,
						intelligence: 3
					},
					icon: '🐴'
				};
			}
		},
		{
			weight: 12,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				
				return {
					type: 'social' as const,
					title: `Кот требует рыбку`,
					description: `${hero.name} встретил кота. Кот потребовал рыбку. Герой подчинился. Теперь кот - босс.`,
					thought: 'Кот главный. Я просто слуга.',
					rewards: {
						exp: 50,
						gold: -15,
						luck: 5
					},
					icon: '🐱'
				};
			}
		}
	],
	
	absurd: [
		{
			weight: 15,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				const location = getRandomLocation();
				
				return {
					type: 'absurd' as const,
					title: `Дождь из сыров`,
					description: `В ${location.name} начался дождь из сыров! ${hero.name} собрал сыры, продал их и разбогател. Обычный день в Тамриэле.`,
					thought: 'Сыр с неба! Мечта сбылась!',
					rewards: {
						exp: 100,
						gold: 200
					},
					icon: '🧀'
				};
			}
		},
		{
			weight: 12,
			generate: (hero: any) => {
				return {
					type: 'absurd' as const,
					title: `Гриб-король`,
					description: `${hero.name} пытался укрыться от дождя под грибом, но гриб оказался живым! И королём! Теперь герой - главный гриб королевства грибов!`,
					thought: 'Я... гриб? Нет, я ГЛАВНЫЙ гриб!',
					rewards: {
						exp: 180,
						gold: 100,
						newTitle: 'Главный Гриб Королевства'
					},
					icon: '🍄'
				};
			}
		},
		{
			weight: 10,
			generate: (hero: any) => {
				return {
					type: 'absurd' as const,
					title: `Телепорт в прошлое`,
					description: `${hero.name} использовал носок-телепорт... и попал в прошлое! Встретил себя, поздоровался, вернулся. Неловко.`,
					thought: 'Я встретил себя. Я себе понравился!',
					rewards: {
						exp: 150,
						gold: 50
					},
					icon: '🧦'
				};
			}
		},
		{
			weight: 8,
			generate: (hero: any) => {
				return {
					type: 'absurd' as const,
					title: `Облака-художники`,
					description: `${hero.name} обнаружил облака, рисующие картины! Облака нарисовали портрет героя. Абстракционизм.`,
					thought: getRandomThought('absurd'),
					rewards: {
						exp: 80,
						gold: 40,
						item: { name: 'Портрет облака', icon: '🖼️', type: 'artifact' }
					},
					icon: '☁️'
				};
			}
		},
		{
			weight: 11,
			generate: (hero: any) => {
				const creature = getRandomCreature();
				
				return {
					type: 'absurd' as const,
					title: `Превращение в сыр`,
					description: `${hero.name} случайно превратился в сыр! Паника! Через минуту превращение прошло. Обычный вторник.`,
					thought: 'Я был сыром. Теперь я не сыр. Жизнь странная.',
					rewards: {
						exp: 120,
						gold: 60,
						luck: 10
					},
					icon: '🧀'
				};
			}
		},
		{
			weight: 9,
			generate: (hero: any) => {
				return {
					type: 'absurd' as const,
					title: `Танец с папоротником`,
					description: `${hero.name} встретил танцующий папоротник и не устоял перед соблазном станцевать вальс. Папоротник лидировал.`,
					thought: 'Танцевал с растением. Оно танцует лучше меня.',
					rewards: {
						exp: 70,
						gold: 30,
						luck: 8
					},
					icon: '🌿'
				};
			}
		},
		{
			weight: 13,
			generate: (hero: any) => {
				const item = getRandomItem();
				
				return {
					type: 'absurd' as const,
					title: `Случайная магия`,
					description: `${hero.name} чихнул и случайно сотворил заклинание! Появился ${item.name}. Магия непредсказуема!`,
					thought: 'Чихнул - получил артефакт. Гениально!',
					rewards: {
						exp: 90,
						gold: 45,
						item: item
					},
					icon: '✨'
				};
			}
		}
	],
	
	death: [
		{
			weight: 5,
			generate: (hero: any) => {
				return {
					type: 'death' as const,
					title: `Смерть от лестницы`,
					description: `${hero.name} умер от падения с лестницы... но лестница извинилась и воскресила героя! Даже подарила золотой зуб!`,
					thought: 'Умер. Воскрес. Получил подарок. Выгодно!',
					rewards: {
						exp: 200,
						gold: 150,
						health: 100,
						item: { name: 'Золотой зуб удачи', icon: '🦷', type: 'artifact' }
					},
					icon: '💀'
				};
			}
		},
		{
			weight: 3,
			generate: (hero: any) => {
				return {
					type: 'death' as const,
					title: `Смерть от смеха`,
					description: `${hero.name} услышал шутку от облака и умер от смеха! Облако испугалось и вернуло героя к жизни.`,
					thought: 'Смешно до смерти... буквально!',
					rewards: {
						exp: 180,
						gold: 100,
						health: 100,
						luck: 15
					},
					icon: '☁️'
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
					title: `Рисование облаков`,
					description: `${hero.name} начал рисовать портреты облаков. Облака позировали. Получились шедевры! Может, кликни?`,
					thought: getRandomThought('idle'),
					rewards: {
						exp: 20,
						gold: 10
					},
					icon: '☁️'
				};
			}
		},
		{
			weight: 8,
			generate: (hero: any) => {
				return {
					type: 'idle' as const,
					title: `Философский трактат`,
					description: `${hero.name} пишет философский трактат о смысле кнопок. Уже 50 страниц! Может, пора кликнуть?`,
					thought: 'Кнопки... их смысл глубок...',
					rewards: {
						exp: 30,
						intelligence: 5
					},
					icon: '📖'
				};
			}
		},
		{
			weight: 7,
			generate: (hero: any) => {
				return {
					type: 'idle' as const,
					title: `Дракон принёс подушку`,
					description: `${hero.name} уснул стоя. Дракон принёс подушку и ушёл. Забота!`,
					thought: getRandomThought('idle'),
					rewards: {
						exp: 25,
						health: 20
					},
					icon: '🐉'
				};
			}
		}
	]
};

/**
 * Генерировать случайное событие
 */
export async function generateEvent(hero: any): Promise<GameEvent> {
	// Определяем вес каждого типа события
	const weights: Record<string, number> = {
		combat: 30,
		exploration: 25,
		social: 20,
		absurd: 20,
		death: 3,
		idle: 2
	};
	
	// Выбираем тип события
	const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
	let random = Math.random() * totalWeight;
	let selectedType: keyof typeof eventTemplates = 'combat';
	
	for (const [type, weight] of Object.entries(weights)) {
		random -= weight;
		if (random <= 0) {
			selectedType = type as keyof typeof eventTemplates;
			break;
		}
	}
	
	// Получаем шаблоны для выбранного типа
	const templates = eventTemplates[selectedType];
	if (!templates || templates.length === 0) {
		selectedType = 'combat'; // fallback
	}
	
	// Выбираем конкретный шаблон по весу
	const templateTotalWeight = eventTemplates[selectedType].reduce((sum, t) => sum + t.weight, 0);
	random = Math.random() * templateTotalWeight;
	
	let selectedTemplate = eventTemplates[selectedType][0];
	for (const template of eventTemplates[selectedType]) {
		random -= template.weight;
		if (random <= 0) {
			selectedTemplate = template;
			break;
		}
	}
	
	// Генерируем событие
	const event = selectedTemplate.generate(hero);
	
	// Автоматически устанавливаем category если её нет
	if (!event.category) {
		event.category = getCategoryByType(event.type);
	}
	
	return event;
}

/**
 * Генерировать idle событие (когда игрок не активен)
 */
export function generateIdleEvent(hero: any, idleTime: number): GameEvent {
	let event: GameEvent;
	if (idleTime < 30000) { // менее 30 секунд
		event = eventTemplates.idle[0].generate(hero);
	} else if (idleTime < 120000) { // менее 2 минут
		event = eventTemplates.idle[1].generate(hero);
	} else { // более 2 минут
		event = eventTemplates.idle[2].generate(hero);
	}
	
	// Автоматически устанавливаем category если её нет
	if (!event.category) {
		event.category = getCategoryByType(event.type);
	}
	
	return event;
}

