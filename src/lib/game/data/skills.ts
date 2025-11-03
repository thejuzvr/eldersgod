// Абсурдные умения для героев
export const skills = [
	// Боевые умения
	{ name: 'Удар носком', description: 'Мастерство атаки обувью', category: 'combat', icon: '👟' },
	{ name: 'Танец смерти', description: 'Путает врагов своей хореографией', category: 'combat', icon: '💃' },
	{ name: 'Критический чих', description: 'Оглушает противников неожиданным чиханием', category: 'combat', icon: '🤧' },
	{ name: 'Защита сыром', description: 'Использует сыр как щит', category: 'combat', icon: '🧀' },
	{ name: 'Ярость кексов', description: 'Бросается кексами с силой балисты', category: 'combat', icon: '🧁' },
	
	// Магия
	{ name: 'Призыв комаров', description: 'Вызывает рой надоедливых комаров', category: 'magic', icon: '🦟' },
	{ name: 'Телепорт в случайное место', description: 'Перемещается... куда-то', category: 'magic', icon: '🌀' },
	{ name: 'Превращение в сыр', description: 'Временно становится сыром (зачем?)', category: 'magic', icon: '🧀' },
	{ name: 'Иллюзия здравого смысла', description: 'Создаёт иллюзию что всё нормально', category: 'magic', icon: '🎭' },
	{ name: 'Огненный носок', description: 'Поджигает носок врага', category: 'magic', icon: '🔥' },
	
	// Скрытность
	{ name: 'Слияние с тенью', description: 'Прячется в тени (даже когда их нет)', category: 'stealth', icon: '👤' },
	{ name: 'Тихий как гром', description: 'Идёт тихо... по своим меркам', category: 'stealth', icon: '🌩️' },
	{ name: 'Карманная кража', description: 'Ворует карманы (не содержимое, сами карманы)', category: 'stealth', icon: '👜' },
	{ name: 'Невидимость для слепых', description: 'Работает только на слепых', category: 'stealth', icon: '👁️' },
	
	// Социальные
	{ name: 'Убеждение сыром', description: 'Всегда носит сыр для переговоров', category: 'social', icon: '🧀' },
	{ name: 'Речь драконов', description: 'Говорит на языке драконов (они не понимают)', category: 'social', icon: '🐉' },
	{ name: 'Очарование грибов', description: 'Грибы его любят', category: 'social', icon: '🍄' },
	{ name: 'Торговля носками', description: 'Эксперт по обмену носков', category: 'social', icon: '🧦' },
	
	// Абсурдные
	{ name: 'Понимание облаков', description: 'Читает мысли облаков', category: 'absurd', icon: '☁️' },
	{ name: 'Дружба с камнями', description: 'Камни отвечают взаимностью', category: 'absurd', icon: '🪨' },
	{ name: 'Телепатия с хлебом', description: 'Слышит мысли выпечки', category: 'absurd', icon: '🍞' },
	{ name: 'Левитация задом наперёд', description: 'Летает... задом', category: 'absurd', icon: '🎈' },
	{ name: 'Предвидение вчерашнего дня', description: 'Видит прошлое (бесполезно)', category: 'absurd', icon: '🔮' },
	{ name: 'Мастер философии носков', description: 'Понимает глубинный смысл носков', category: 'absurd', icon: '🧦' },
	{ name: 'Укрощение пыли', description: 'Пыль подчиняется воле', category: 'absurd', icon: '💨' },
	{ name: 'Говорение с эхом', description: 'Эхо иногда отвечает по-другому', category: 'absurd', icon: '🗣️' }
];

export function getRandomSkill() {
	return skills[Math.floor(Math.random() * skills.length)];
}

export function getSkillsByCategory(category: string) {
	return skills.filter(skill => skill.category === category);
}

