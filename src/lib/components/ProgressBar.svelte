<script lang="ts">
	export let current: number = 0;
	export let max: number = 100;
	export let label: string = '';
	export let showText: boolean = true;
	export let color: string = 'var(--accent-primary)';
	export let height: string = '20px';
	
	$: percent = Math.min(Math.max((current / max) * 100, 0), 100);
</script>

<div class="w-full">
	{#if label}
		<div class="flex justify-between items-center mb-1">
			<span class="text-xs text-text-muted">{label}</span>
			{#if showText}
				<span class="text-xs font-medium text-text-primary">{current} / {max}</span>
			{/if}
		</div>
	{/if}
	
	<div class="stat-bar" style="height: {height};">
		<div 
			class="stat-bar-fill transition-all duration-500" 
			style="width: {percent}%; background: {color};"
		></div>
		{#if showText && !label}
			<div class="stat-bar-text">{current} / {max}</div>
		{/if}
	</div>
</div>

