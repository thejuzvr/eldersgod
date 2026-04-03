<script lang="ts">
	import Navigation from './Navigation.svelte';
	import Notifications from './Notifications.svelte';
	
	export let showLeftPanel = true;
	export let showRightPanel = true;
	export let showNavigation = true;
</script>

<Notifications />

{#if showNavigation}
	<Navigation />
{/if}

<div class="min-h-screen p-4 bg-bg-secondary">
	<div class="max-w-7xl mx-auto">
		
	<!-- Основной layout -->
	<div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
		<!-- Левая панель (герой) -->
		{#if showLeftPanel}
			<div class="lg:col-span-3">
				<slot name="left-panel" />
			</div>
		{/if}
		
		<!-- Центр (дневник) -->
		{#if showLeftPanel && showRightPanel}
			<div class="lg:col-span-6">
				<slot name="center" />
			</div>
		{:else if showLeftPanel || showRightPanel}
			<div class="lg:col-span-9">
				<slot name="center" />
			</div>
		{:else}
			<div class="lg:col-span-12">
				<slot name="center" />
			</div>
		{/if}
		
		<!-- Правая панель (арена + встречи) -->
		{#if showRightPanel}
			<div class="lg:col-span-3">
				<slot name="right-panel" />
			</div>
		{/if}
	</div>
	</div>
</div>

