<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getRandomThought } from '$lib/game/data/thoughts';
	import { createEventDispatcher } from 'svelte';
	import { heroStore } from '$lib/stores/gameStore';
	
	export let autoGenerate = true;
	export let interval = 15000; // 15 секунд
	
	const dispatch = createEventDispatcher();
	
	let thought = '';
	let visible = false;
	let timer: any;
	
	function generateThought() {
		// Подписываемся на состояние героя, чтобы передать контекст
		let currentHero: any;
		const unsubscribe = heroStore.subscribe(value => {
			currentHero = value;
		});

		let category = 'generic_neutral';

		if (currentHero) {
			// Простейшее дерево поведения (Behavior Tree)
			const healthPercentage = currentHero.maxHealth ? (currentHero.currentHealth / currentHero.maxHealth) : 1;

			if (healthPercentage < 0.3) {
				category = 'low_health';
			} else if (Math.random() > 0.8) {
				category = 'absurd';
			} else if (currentHero.currentLocation && currentHero.currentLocation.includes('Окрестности')) {
				category = 'traveling';
			} else {
				category = Math.random() > 0.5 ? 'generic_happy' : 'generic_neutral';
			}
		}

		thought = getRandomThought(category as any, currentHero?.name || 'Герой');
		visible = true;
		
		unsubscribe();

		// Скрываем через 10 секунд
		setTimeout(() => {
			visible = false;
		}, 10000);
	}
	
	function handleClick() {
		dispatch('click');
		visible = false;
	}
	
	onMount(() => {
		if (autoGenerate) {
			timer = setInterval(generateThought, interval);
			generateThought(); // Первая мысль сразу
		}
	});
	
	onDestroy(() => {
		if (timer) {
			clearInterval(timer);
		}
	});
</script>

{#if visible}
	<div 
		class="hero-thought fade-in-up cursor-pointer hover:bg-bg-secondary transition-all"
		on:click={handleClick}
		on:keypress={handleClick}
		role="button"
		tabindex="0"
	>
		<span>"{thought}"</span>
		<div class="text-xs text-text-muted mt-2 text-right">
			(Кликни для мини-игры!)
		</div>
	</div>
{/if}
