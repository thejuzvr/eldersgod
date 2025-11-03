<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import { writable } from 'svelte/store';
	
	const dispatch = createEventDispatcher();
	
	export let hero1: any;
	export let hero2: any;
	
	const battleLog = writable<string[]>([]);
	const hero1HP = writable(100);
	const hero2HP = writable(100);
	const currentRound = writable(0);
	const battleEnded = writable(false);
	const winner = writable<any>(null);
	
	// Забавные реплики для боя
	const combatPhrases = [
		'{attacker} размахивает мечом как веником!',
		'{defender} уворачивается, споткнувшись о камень!',
		'{attacker} кричит боевой клич (звучит как икота)!',
		'{defender} пытается использовать магию, но забыл слова!',
		'{attacker} атакует с силой тысячи котят!',
		'{defender} защищается сырным щитом!',
		'{attacker} танцует танец смерти (или просто спотыкается)',
		'{defender} парирует удар... случайно!',
		'{attacker} использует секретную технику "Удар носком"!',
		'{defender} кричит: "Это было нечестно!" и плачет',
		'{attacker} призывает силу абсурда!',
		'{defender} пытается договориться, но {attacker} не слушает',
		'{attacker} использует "Критический удар по самолюбию"!',
		'{defender} теряет волю к сопротивлению (и носок)',
		'{attacker} находит брешь в обороне (и пару монет)!',
		'{defender} вспоминает все свои грехи',
		'{attacker} наносит удар с криком: "За кексы!"',
		'{defender} думает о смысле жизни во время боя'
	];
	
	function getRandomPhrase(attacker: string, defender: string): string {
		const phrase = combatPhrases[Math.floor(Math.random() * combatPhrases.length)];
		return phrase
			.replace('{attacker}', attacker)
			.replace('{defender}', defender);
	}
	
	function simulateBattle() {
		let h1HP = 100;
		let h2HP = 100;
		let round = 0;
		const maxRounds = 10;
		
		const interval = setInterval(() => {
			round++;
			currentRound.set(round);
			
			// Определяем атакующего (чередуем)
			const isHero1Turn = round % 2 === 1;
			const attacker = isHero1Turn ? hero1 : hero2;
			const defender = isHero1Turn ? hero2 : hero1;
			
			// Расчёт урона (с учётом характеристик)
			const attackerStr = attacker.strength || 10;
			const defenderLuck = defender.luck || 10;
			const baseDamage = Math.floor(Math.random() * 20) + 10;
			const damage = Math.max(5, baseDamage + attackerStr - defenderLuck);
			
			// Применяем урон
			if (isHero1Turn) {
				h2HP = Math.max(0, h2HP - damage);
				hero2HP.set(h2HP);
			} else {
				h1HP = Math.max(0, h1HP - damage);
				hero1HP.set(h1HP);
			}
			
			// Добавляем реплику в лог
			const phrase = getRandomPhrase(attacker.name, defender.name);
			battleLog.update(log => [
				...log,
				`Раунд ${round}: ${phrase} (Урон: ${damage})`
			]);
			
			// Проверка завершения боя
			if (h1HP <= 0 || h2HP <= 0 || round >= maxRounds) {
				clearInterval(interval);
				battleEnded.set(true);
				
				// Определяем победителя
				const battleWinner = h1HP > h2HP ? hero1 : hero2;
				winner.set(battleWinner);
				
				battleLog.update(log => [
					...log,
					'',
					`🏆 Победитель: ${battleWinner.name}!`
				]);
				
				// Отправляем результат
				setTimeout(() => {
					dispatch('battleEnd', {
						winner: battleWinner,
						loser: h1HP > h2HP ? hero2 : hero1,
						rounds: round,
						log: $battleLog
					});
				}, 2000);
			}
		}, 1500); // Каждый раунд длится 1.5 секунды
	}
	
	onMount(() => {
		simulateBattle();
	});
</script>

<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
	<div class="parchment max-w-2xl w-full p-6 shadow-lg">
		<h2 class="text-2xl font-semibold text-center mb-4 text-text-primary">⚔️ Бой на арене!</h2>
		
		<!-- Бойцы -->
		<div class="grid grid-cols-2 gap-4 mb-6">
			<!-- Герой 1 -->
			<div class="text-center p-4 bg-bg-secondary rounded border border-border-medium">
				<h3 class="font-semibold text-text-primary mb-2">{hero1.name}</h3>
				<p class="text-xs text-text-muted mb-2">Ур. {hero1.level}</p>
				<div class="stat-bar h-4 mb-1">
					<div 
						class="stat-bar-fill h-full transition-all duration-500" 
						style="width: {$hero1HP}%; background: var(--success);"
					></div>
				</div>
				<p class="text-xs text-text-muted">HP: {Math.floor($hero1HP)}%</p>
			</div>
			
			<!-- VS -->
			<div class="flex items-center justify-center">
				<span class="text-3xl font-bold text-accent-primary">VS</span>
			</div>
			
			<!-- Герой 2 -->
			<div class="text-center p-4 bg-bg-secondary rounded border border-border-medium">
				<h3 class="font-semibold text-text-primary mb-2">{hero2.name}</h3>
				<p class="text-xs text-text-muted mb-2">Ур. {hero2.level}</p>
				<div class="stat-bar h-4 mb-1">
					<div 
						class="stat-bar-fill h-full transition-all duration-500" 
						style="width: {$hero2HP}%; background: var(--success);"
					></div>
				</div>
				<p class="text-xs text-text-muted">HP: {Math.floor($hero2HP)}%</p>
			</div>
		</div>
		
		<!-- Раунд -->
		<div class="text-center mb-4">
			<p class="text-sm font-medium text-text-secondary">Раунд {$currentRound}</p>
		</div>
		
		<!-- Лог боя -->
		<div class="bg-bg-secondary border border-border-light rounded p-4 h-64 overflow-y-auto">
			<h4 class="text-sm font-semibold mb-3 text-text-primary">📜 Ход боя:</h4>
			<div class="space-y-2">
				{#each $battleLog as logEntry}
					<p class="text-xs text-text-secondary leading-relaxed">{logEntry}</p>
				{/each}
			</div>
		</div>
		
		{#if $battleEnded}
			<div class="mt-4 text-center">
				<p class="text-lg font-semibold mb-2" 
					class:text-success={$winner?.id === hero1.id}
					class:text-danger={$winner?.id !== hero1.id}
				>
					{$winner?.id === hero1.id ? '🎉 Вы победили!' : '😢 Вы проиграли!'}
				</p>
			</div>
		{/if}
	</div>
</div>

