<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { GameContent } from '$lib/server/db/schema';
	
	export let content: GameContent | null = null;
	
	const dispatch = createEventDispatcher();
	
	// Форма
	let formData = {
		type: 'title',
		name: '',
		text: '',
		category: '',
		rarity: 'common',
		weight: 1,
		icon: '✨',
		color: '#ffffff',
		tags: '',
		isActive: true
	};
	
	// Состояние
	let loading = false;
	let error = '';
	let success = '';
	
	// Опции для селектов
	const contentTypes = [
		{ value: 'title', label: 'Титул', icon: '👑' },
		{ value: 'thought', label: 'Мысль', icon: '💭' },
		{ value: 'item', label: 'Предмет', icon: '⚔️' },
		{ value: 'creature', label: 'Существо', icon: '🐉' },
		{ value: 'location', label: 'Локация', icon: '🌍' },
		{ value: 'action', label: 'Действие', icon: '🎭' },
		{ value: 'skill', label: 'Навык', icon: '📚' }
	];
	
	const rarities = [
		{ value: 'common', label: 'Обычный' },
		{ value: 'uncommon', label: 'Необычный' },
		{ value: 'rare', label: 'Редкий' },
		{ value: 'epic', label: 'Эпический' },
		{ value: 'legendary', label: 'Легендарный' },
		{ value: 'absurd', label: 'Абсурдный' }
	];
	
	const commonIcons = [
		'✨', '💭', '⚔️', '🛡️', '🏹', '🔥', '❄️', '🌟', '💎', '👑',
		'🐉', '🐺', '🦁', '🦅', '🐸', '🦄', '🧙‍♂️', '🧝‍♀️', '👨‍💼', '👩‍🎓',
		'🏰', '🏛️', '🌍', '🏔️', '🏞️', '🏖️', '🏰', '⚓', '🎭', '🎪',
		'🎯', '🎲', '🎳', '🧩', '🎮', '📚', '🔮', '⚗️', '🧪', '💊',
		'🍎', '🍊', '🍋', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🥥',
		'🍞', '🧀', '🍗', '🍕', '🍔', '🌮', '🥗', '🍝', '🍜', '🍲'
	];
	
	// Инициализация формы
	onMount(() => {
		if (content) {
			formData = {
				type: content.type,
				name: content.name || '',
				text: content.text || '',
				category: content.category || '',
				rarity: content.rarity || 'common',
				weight: content.weight || 1,
				icon: content.icon || '✨',
				color: content.color || '#ffffff',
				tags: content.tags ? content.tags.join(', ') : '',
				isActive: content.isActive
			};
		}
	});
	
	// Валидация формы
	function validateForm() {
		if (!formData.type) {
			error = 'Выберите тип контента';
			return false;
		}
		
		if (formData.type === 'title' && !formData.name) {
			error = 'Название титула обязательно';
			return false;
		}
		
		if (formData.type === 'thought' && !formData.text) {
			error = 'Текст мысли обязателен';
			return false;
		}
		
		if (!formData.name && !formData.text) {
			error = 'Введите название или текст';
			return false;
		}
		
		return true;
	}
	
	// Обработка отправки формы
	async function handleSubmit() {
		if (!validateForm()) {
			return;
		}
		
		loading = true;
		error = '';
		success = '';
		
		try {
			// Подготавливаем данные
			const contentData = {
				type: formData.type,
				name: formData.name || null,
				text: formData.text || null,
				category: formData.category || null,
				rarity: formData.rarity,
				weight: formData.weight,
				icon: formData.icon,
				color: formData.color,
				tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : [],
				isActive: formData.isActive,
				data: getDefaultData(formData.type),
				metadata: {
					source: 'admin-panel',
					version: '1.0.0',
					createdVia: 'content-form'
				}
			};
			
			// Создаем или обновляем контент через API
			if (content) {
				// Обновление
				const response = await fetch(`/api/content/${content.id}`, {
					method: 'PUT',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(contentData)
				});
				
				const result = await response.json();
				if (result.success) {
					success = 'Контент успешно обновлён';
				} else {
					throw new Error(result.error);
				}
			} else {
				// Создание
				const response = await fetch('/api/content', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(contentData)
				});
				
				const result = await response.json();
				if (result.success) {
					success = 'Контент успешно создан';
				} else {
					throw new Error(result.error);
				}
			}
			
			// Закрываем форму через 1.5 секунды
			setTimeout(() => {
				dispatch('saved');
			}, 1500);
			
		} catch (err) {
			error = err instanceof Error ? err.message : 'Ошибка при сохранении';
		} finally {
			loading = false;
		}
	}
	
	// Получить данные по умолчанию для типа контента
	function getDefaultData(type: string) {
		switch (type) {
			case 'title':
				return { description: 'Игровой титул', prestige: Math.min(formData.weight, 10) };
			case 'thought':
				return { mood: 'neutral', context: formData.category || 'general' };
			case 'item':
				return {
					type: 'artifact',
					description: formData.text || 'Игровой предмет',
					stats: { strength: 0, intelligence: 0, luck: 0, health: 0, mana: 0 },
					price: 10
				};
			case 'creature':
				return {
					description: formData.text || 'Игровое существо',
					category: 'monster',
					behavior: 'neutral',
					health: 50,
					strength: 5,
					intelligence: 5
				};
			case 'location':
				return {
					description: formData.text || 'Игровая локация',
					category: 'city',
					region: 'other',
					environment: 'plains'
				};
			case 'action':
				return { context: formData.category || 'general', successRate: 0.5 };
			case 'skill':
				return {
					description: formData.text || 'Игровой навык',
					level: 1,
					experienceRequired: 0
				};
			default:
				return {};
		}
	}
	
	// Обработка кнопки "Отмена"
	function handleCancel() {
		dispatch('close');
	}
	
	// Изменение типа контента
	function handleTypeChange() {
		// Очищаем форму при изменении типа
		formData.name = '';
		formData.text = '';
		formData.category = '';
		formData.icon = '✨';
	}
</script>

<div class="content-form">
	<form on:submit|preventDefault={handleSubmit} class="space-y-6">
		<!-- Ошибки и уведомления -->
		{#if error}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
				❌ {error}
			</div>
		{/if}
		
		{#if success}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
				✅ {success}
			</div>
		{/if}
		
		<!-- Тип контента -->
		<div>
			<label for="type" class="block text-sm font-medium text-gray-700 mb-2">
				Тип контента *
			</label>
			<select
				id="type"
				bind:value={formData.type}
				on:change={handleTypeChange}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				required
			>
				{#each contentTypes as type}
					<option value={type.value}>
						{type.icon} {type.label}
					</option>
				{/each}
			</select>
		</div>
		
		<!-- Название -->
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700 mb-2">
				Название
				{#if formData.type === 'title'}
					<span class="text-red-500">*</span>
				{/if}
			</label>
			<input
				type="text"
				id="name"
				bind:value={formData.name}
				placeholder="Введите название"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
		
		<!-- Текст -->
		<div>
			<label for="text" class="block text-sm font-medium text-gray-700 mb-2">
				Текст
				{#if formData.type === 'thought'}
					<span class="text-red-500">*</span>
				{/if}
			</label>
			<textarea
				id="text"
				bind:value={formData.text}
				placeholder="Введите текст"
				rows="3"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			></textarea>
		</div>
		
		<!-- Категория -->
		<div>
			<label for="category" class="block text-sm font-medium text-gray-700 mb-2">
				Категория
			</label>
			<input
				type="text"
				id="category"
				bind:value={formData.category}
				placeholder="Например: heroic, noble, general"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
		
		<!-- Редкость -->
		<div>
			<label for="rarity" class="block text-sm font-medium text-gray-700 mb-2">
				Редкость
			</label>
			<select
				id="rarity"
				bind:value={formData.rarity}
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			>
				{#each rarities as rarity}
					<option value={rarity.value}>{rarity.label}</option>
				{/each}
			</select>
		</div>
		
		<!-- Вес -->
		<div>
			<label for="weight" class="block text-sm font-medium text-gray-700 mb-2">
				Вес (0-100)
			</label>
			<input
				type="number"
				id="weight"
				bind:value={formData.weight}
				min="0"
				max="100"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
		
		<!-- Иконка -->
		<div>
			<label for="icon" class="block text-sm font-medium text-gray-700 mb-2">
				Иконка
			</label>
			<div class="flex items-center gap-2">
				<input
					type="text"
					id="icon"
					bind:value={formData.icon}
					placeholder="✨"
					maxlength="2"
					class="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
				/>
				<button
					type="button"
					class="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
					on:click={() => formData.icon = commonIcons[Math.floor(Math.random() * commonIcons.length)]}
				>
					Случайная
				</button>
			</div>
			<div class="mt-2 flex flex-wrap gap-1">
				{#each commonIcons.slice(0, 20) as icon}
					<button
						type="button"
						class="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded text-lg"
						on:click={() => formData.icon = icon}
					>
						{icon}
					</button>
				{/each}
			</div>
		</div>
		
		<!-- Теги -->
		<div>
			<label for="tags" class="block text-sm font-medium text-gray-700 mb-2">
				Теги (через запятую)
			</label>
			<input
				type="text"
				id="tags"
				bind:value={formData.tags}
				placeholder="tag1, tag2, tag3"
				class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
			/>
		</div>
		
		<!-- Активность -->
		<div class="flex items-center">
			<input
				type="checkbox"
				id="isActive"
				bind:checked={formData.isActive}
				class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
			/>
			<label for="isActive" class="ml-2 text-sm text-gray-700">
				Активный контент
			</label>
		</div>
		
		<!-- Кнопки -->
		<div class="flex justify-end gap-3 pt-4 border-t border-gray-200">
			<button
				type="button"
				on:click={handleCancel}
				class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
			>
				Отмена
			</button>
			<button
				type="submit"
				disabled={loading}
				class="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-medium"
			>
				{loading ? 'Сохранение...' : (content ? 'Обновить' : 'Создать')}
			</button>
		</div>
	</form>
</div>

<style>
	.content-form {
		max-width: 100%;
	}
</style>