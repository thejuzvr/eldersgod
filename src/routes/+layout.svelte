<script lang="ts">
	import '../app.css';
	import { onMount } from 'svelte';

	let isDark = false;

	onMount(() => {
		// Проверяем сохраненную тему или системные настройки
		const savedTheme = localStorage.getItem('theme');
		if (savedTheme === 'dark' || (!savedTheme && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
			isDark = true;
			document.documentElement.classList.add('dark');
		}
	});

	function toggleTheme() {
		isDark = !isDark;
		if (isDark) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	}
</script>

<!-- Кнопка переключения темы (Глобальная, плавающая) -->
<button
	class="fixed bottom-4 left-4 z-50 p-3 rounded-full bg-bg-tertiary border border-border-medium shadow-lg hover:bg-bg-secondary transition-colors"
	on:click={toggleTheme}
	title={isDark ? "Светлая тема" : "Темная тема"}
>
	{isDark ? '☀️' : '🌙'}
</button>

<slot />
