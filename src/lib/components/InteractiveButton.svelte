<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let text = 'Кликни!';
	export let disabled = false;
	
	const dispatch = createEventDispatcher();
	
	function handleClick() {
		if (!disabled) {
			dispatch('click');
		}
	}
</script>

<button 
	class="btn btn-interactive cursor-blink"
	class:opacity-50={disabled}
	on:click={handleClick}
	{disabled}
>
	{text}
</button>

