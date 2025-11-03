<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let heroId: number;
	export let currentPrayer: number = 100; // Сила молитвы (0-100)
	
	const dispatch = createEventDispatcher();
	
	let blessing = false;
	let punishment = false;
	let lastAction: 'bless' | 'punish' | null = null;
	let cooldown = 0;
	let message = '';
	
	const blessings = [
		'Божественный свет окутывает героя!',
		'Силы небес благословляют {hero}!',
		'Удача улыбнулась {hero}!',
		'Боги одобряют действия героя!',
		'Небесная мощь наполняет {hero}!'
	];
	
	const punishments = [
		'Гром гремит над головой героя!',
		'Боги недовольны {hero}!',
		'Небесная кара настигает героя!',
		'Божественный гнев обрушивается на {hero}!',
		'{hero} чувствует тяжесть божественного взгляда!'
	];
	
	async function handleBlessing() {
		if (cooldown > 0 || currentPrayer < 30) return;
		
		blessing = true;
		lastAction = 'bless';
		
		try {
			const response = await fetch(`/api/hero/${heroId}/divine-action`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					action: 'bless',
					prayerCost: 30
				})
			});
			
			const result = await response.json();
			
			if (result.success) {
				message = blessings[Math.floor(Math.random() * blessings.length)];
				dispatch('actionSuccess', { type: 'bless', result });
				startCooldown(60); // 60 секунд
			}
		} catch (error) {
			console.error('Blessing failed:', error);
		}
		
		setTimeout(() => {
			blessing = false;
			message = '';
		}, 3000);
	}
	
	async function handlePunishment() {
		if (cooldown > 0 || currentPrayer < 30) return;
		
		punishment = true;
		lastAction = 'punish';
		
		try {
			const response = await fetch(`/api/hero/${heroId}/divine-action`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ 
					action: 'punish',
					prayerCost: 30
				})
			});
			
			const result = await response.json();
			
			if (result.success) {
				message = punishments[Math.floor(Math.random() * punishments.length)];
				dispatch('actionSuccess', { type: 'punish', result });
				startCooldown(60); // 60 секунд
			}
		} catch (error) {
			console.error('Punishment failed:', error);
		}
		
		setTimeout(() => {
			punishment = false;
			message = '';
		}, 3000);
	}
	
	function startCooldown(seconds: number) {
		cooldown = seconds;
		const interval = setInterval(() => {
			cooldown--;
			if (cooldown <= 0) {
				clearInterval(interval);
			}
		}, 1000);
	}
</script>

<div class="panel relative" style="z-index: 10;">
	<div class="text-center border-b border-border-light pb-3 mb-4">
		<h3 class="text-lg font-semibold text-text-primary">⚡ Божественный Пульт</h3>
		<p class="text-xs text-text-muted mt-1">Влияйте на судьбу героя</p>
	</div>
	
	<!-- Сила молитвы -->
	<div class="mb-4">
		<div class="flex justify-between items-center mb-2">
			<span class="text-xs font-medium text-text-secondary">🙏 Сила молитвы</span>
			<span class="text-xs text-text-primary font-semibold">{currentPrayer}%</span>
		</div>
		<div class="stat-bar h-2">
			<div 
				class="stat-bar-fill h-full transition-all duration-500" 
				style="width: {currentPrayer}%; background: var(--info);"
			></div>
		</div>
		<p class="text-xs text-text-muted mt-1">Восстанавливается со временем</p>
	</div>
	
	<!-- Кнопки действий -->
	<div class="grid grid-cols-2 gap-3 mb-4 relative z-10">
		<button
			class="btn py-3 transition-all relative"
			class:btn-interactive={currentPrayer >= 30 && cooldown === 0}
			class:opacity-50={currentPrayer < 30 || cooldown > 0}
			class:bg-success={blessing}
			class:text-bg-primary={blessing}
			on:click={handleBlessing}
			disabled={currentPrayer < 30 || cooldown > 0}
			style="z-index: 20;"
		>
			<div class="text-2xl mb-1">✨</div>
			<div class="text-xs font-medium">Благословить</div>
			<div class="text-xs mt-1" class:text-text-muted={!blessing} class:text-bg-primary={blessing}>(-30%)</div>
		</button>
		
		<button
			class="btn py-3 transition-all relative"
			class:btn-interactive={currentPrayer >= 30 && cooldown === 0}
			class:opacity-50={currentPrayer < 30 || cooldown > 0}
			class:bg-danger={punishment}
			class:text-bg-primary={punishment}
			on:click={handlePunishment}
			disabled={currentPrayer < 30 || cooldown > 0}
			style="z-index: 20;"
		>
			<div class="text-2xl mb-1">⚡</div>
			<div class="text-xs font-medium">Наказать</div>
			<div class="text-xs mt-1" class:text-text-muted={!punishment} class:text-bg-primary={punishment}>(-30%)</div>
		</button>
	</div>
	
	<!-- Сообщение о действии -->
	{#if message}
		<div 
			class="p-3 rounded border text-center text-sm font-medium animate-pulse"
			class:bg-success={lastAction === 'bless'}
			class:bg-opacity-10={true}
			class:border-success={lastAction === 'bless'}
			class:text-success={lastAction === 'bless'}
			class:bg-danger={lastAction === 'punish'}
			class:border-danger={lastAction === 'punish'}
			class:text-danger={lastAction === 'punish'}
		>
			{message}
		</div>
	{/if}
	
	<!-- Кулдаун -->
	{#if cooldown > 0}
		<div class="mt-3 p-2 bg-bg-tertiary rounded text-center">
			<p class="text-xs text-text-muted">Следующее действие через: <span class="font-semibold text-text-primary">{cooldown}с</span></p>
		</div>
	{/if}
	
	<!-- Эффекты -->
	<div class="mt-4 pt-4 border-t border-border-light">
		<h4 class="text-xs font-semibold mb-2 text-text-primary">Эффекты:</h4>
		<div class="space-y-1 text-xs text-text-secondary">
			<p>✨ <span class="font-medium">Благословение:</span> +20 HP, +50 опыта, +25 золота</p>
			<p>⚡ <span class="font-medium">Наказание:</span> -15 HP, +30 опыта (через боль)</p>
		</div>
	</div>
</div>

