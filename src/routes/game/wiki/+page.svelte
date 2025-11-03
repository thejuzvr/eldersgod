<script lang="ts">
	import GameLayout from '$lib/components/GameLayout.svelte';
	
	export let data;
	
	const wikiSections = [
		{
			id: 'about',
			title: 'О игре',
			icon: '📖',
			content: `
				<h3>Добро пожаловать в Elder Scrolls: Автоприключения!</h3>
				<p>Это абсурдная idle-игра, где ваш герой автоматически переживает приключения в мире Тамриэля.</p>
				<p>Наблюдайте за его похождениями, влияйте на судьбу божественными силами и наслаждайтесь безумием!</p>
			`
		},
		{
			id: 'mechanics',
			title: 'Игровые механики',
			icon: '⚙️',
			content: `
				<h3>Как играть?</h3>
				<ul>
					<li><strong>События:</strong> Генерируются каждые 15-180 секунд автоматически</li>
					<li><strong>Опыт и уровни:</strong> Получайте опыт из событий, растите в уровнях</li>
					<li><strong>Божественные силы:</strong> Благословляйте или наказывайте героя</li>
					<li><strong>Арена:</strong> Сражайтесь с героями других игроков</li>
					<li><strong>Мини-игры:</strong> Кликайте на мысли героя для активации</li>
					<li><strong>Квесты:</strong> Выполняйте задания для получения наград</li>
				</ul>
			`
		},
		{
			id: 'locations',
			title: 'Локации',
			icon: '🗺️',
			content: `
				<h3>Мир Тамриэля</h3>
				<p>Ваш герой путешествует по различным локациям:</p>
				<ul>
					<li><strong>Скайрим:</strong> Вайтран, Рифтен, Солитьюд, Виндхельм</li>
					<li><strong>Морровинд:</strong> Вивек, Балмора, Альд-Рун</li>
					<li><strong>Сиродиил:</strong> Имперский Город, Бравил, Анвил</li>
					<li><strong>Абсурдные места:</strong> Колодец с драконом, Гора вечного сыра, и многое другое!</li>
				</ul>
			`
		},
		{
			id: 'creatures',
			title: 'Существа',
			icon: '🐉',
			content: `
				<h3>Кто населяет этот мир?</h3>
				<p>Помимо обычных существ, здесь вы встретите:</p>
				<ul>
					<li>🐲 Кекс-драконы - пекут себе подобных</li>
					<li>🍞 Агрессивный хлеб - атакует из засады</li>
					<li>🍄 Философские грибы - задают сложные вопросы</li>
					<li>🧦 Носки-телепорты - перемещают вас куда не надо</li>
					<li>🧀 Сырные големы - защищают Гору вечного сыра</li>
				</ul>
			`
		},
		{
			id: 'items',
			title: 'Предметы',
			icon: '🎒',
			content: `
				<h3>Что можно найти?</h3>
				<p>Мир полон абсурдных артефактов:</p>
				<ul>
					<li><strong>Оружие:</strong> Меч-палка, Копьё из вопросов, Лук без стрел</li>
					<li><strong>Броня:</strong> Шлем-кастрюля, Сырный щит, Носки силы</li>
					<li><strong>Артефакты:</strong> Джемная душа, Философский камень (обычный камень)</li>
					<li><strong>Расходники:</strong> Зелье здравого смысла (не работает)</li>
				</ul>
			`
		},
		{
			id: 'contribute',
			title: 'Как помочь проекту',
			icon: '💡',
			content: `
				<h3>Предлагайте свои идеи!</h3>
				<p>Игра развивается благодаря вашим идеям. Вы можете:</p>
				<ul>
					<li>Предложить новые события через форму "Ящик идей"</li>
					<li>Придумать новых существ и локации</li>
					<li>Создать забавные предметы и артефакты</li>
					<li>Написать абсурдные квесты</li>
				</ul>
				<p class="mt-3">Лучшие идеи будут добавлены в игру!</p>
			`
		}
	];
	
	let selectedSection = 'about';
</script>

<svelte:head>
	<title>Wiki | Elder Scrolls: Автоприключения</title>
</svelte:head>

<GameLayout showLeftPanel={false} showRightPanel={false}>
	<div slot="center" class="space-y-4">
		<div class="panel">
			<h1 class="text-2xl font-bold text-center mb-6 text-text-primary">📖 Энциклопедия Абсурда</h1>
			
			<div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
				<!-- Меню разделов -->
				<div class="lg:col-span-1">
					<div class="space-y-2">
						{#each wikiSections as section}
							<button
								class="w-full text-left p-3 rounded border transition-all"
								class:bg-accent-primary={selectedSection === section.id}
								class:text-bg-primary={selectedSection === section.id}
								class:border-accent-primary={selectedSection === section.id}
								class:bg-bg-secondary={selectedSection !== section.id}
								class:border-border-light={selectedSection !== section.id}
								class:hover:border-border-medium={selectedSection !== section.id}
								on:click={() => selectedSection = section.id}
							>
								<span class="text-xl mr-2">{section.icon}</span>
								<span class="text-sm font-medium">{section.title}</span>
							</button>
						{/each}
					</div>
				</div>
				
				<!-- Контент раздела -->
				<div class="lg:col-span-3">
					<div class="bg-bg-primary border border-border-light rounded-lg p-6">
						{#each wikiSections as section}
							{#if selectedSection === section.id}
								<div class="wiki-content">
									{@html section.content}
								</div>
							{/if}
						{/each}
					</div>
				</div>
			</div>
			
			<!-- Футер -->
			<div class="mt-6 pt-6 border-t border-border-light">
				<p class="text-center text-xs text-text-muted">
					💡 Хотите добавить свой раздел в Wiki? Отправьте идею через форму "Ящик идей"!
				</p>
			</div>
		</div>
	</div>
</GameLayout>

<style>
	.wiki-content :global(h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}
	
	.wiki-content :global(p) {
		margin-bottom: 0.75rem;
		color: var(--text-secondary);
		line-height: 1.6;
	}
	
	.wiki-content :global(ul) {
		margin-left: 1.5rem;
		margin-bottom: 1rem;
		list-style-type: disc;
	}
	
	.wiki-content :global(li) {
		margin-bottom: 0.5rem;
		color: var(--text-secondary);
		line-height: 1.5;
	}
	
	.wiki-content :global(strong) {
		font-weight: 600;
		color: var(--text-primary);
	}
	
	.wiki-content :global(.mt-3) {
		margin-top: 0.75rem;
	}
</style>

