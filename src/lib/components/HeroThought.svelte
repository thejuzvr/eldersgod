<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { getRandomThought } from '$lib/game/data/thoughts';
	import { createEventDispatcher } from 'svelte';
	
	export let autoGenerate = true;
	export let interval = 15000; // 15 секунд
	
	const dispatch = createEventDispatcher();
	
	let thought = '';
	let visible = false;
	let timer: any;
	
	function generateThought() {
		thought = getRandomThought();
		visible = true;
		
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

