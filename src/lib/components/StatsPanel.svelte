<script lang="ts">
	import { onMount } from 'svelte';
	
	export let label: string;
	export let value: number;
	export let icon: string;
	export let previousValue: number | undefined = undefined;
	
	let displayValue = value;
	let particles: Array<{ id: number; value: number }> = [];
	let particleId = 0;
	
	// Анимированный счётчик
	$: if (value !== displayValue) {
		animateValue(displayValue, value);
		
		// Создаём particles при изменении
		if (previousValue !== undefined && value !== previousValue) {
			const delta = value - previousValue;
			particles = [...particles, { id: particleId++, value: delta }];
			
			setTimeout(() => {
				particles = particles.filter(p => p.id !== particleId - 1);
			}, 2000);
		}
	}
	
	function animateValue(start: number, end: number) {
		const duration = 500;
		const steps = 20;
		const stepValue = (end - start) / steps;
		const stepDuration = duration / steps;
		
		let currentStep = 0;
		
		const timer = setInterval(() => {
			currentStep++;
			displayValue = Math.round(start + stepValue * currentStep);
			
			if (currentStep >= steps) {
				displayValue = end;
				clearInterval(timer);
			}
		}, stepDuration);
	}
</script>

<div class="relative p-3 bg-bg-primary rounded border border-border-light hover:border-border-medium transition-all">
	<div class="flex items-center justify-between">
		<div class="text-2xl">{icon}</div>
		<div class="text-right">
			<div class="text-xs text-text-muted">{label}</div>
			<div class="text-xl font-semibold text-text-primary">
				{displayValue}
			</div>
		</div>
	</div>
	
	<!-- Particles -->
	{#each particles as particle (particle.id)}
		<div 
			class="particle absolute top-0 right-4 text-lg font-semibold"
			class:text-success={particle.value > 0}
			class:text-danger={particle.value < 0}
		>
			{particle.value > 0 ? '+' : ''}{particle.value}
		</div>
	{/each}
</div>

