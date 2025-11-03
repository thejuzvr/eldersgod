import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: [
		'./src/**/*.{html,js,svelte,ts}'
	],
	theme: {
		extend: {
			colors: {
				// Светлая строгая палитра
				'bg-primary': '#FFFFFF',
				'bg-secondary': '#F8F9FA',
				'bg-tertiary': '#E9ECEF',
				'border-light': '#DEE2E6',
				'border-medium': '#ADB5BD',
				'border-dark': '#6C757D',
				'text-primary': '#212529',
				'text-secondary': '#495057',
				'text-muted': '#6C757D',
				'accent-primary': '#495057',
				'accent-secondary': '#6C757D',
				'success': '#28A745',
				'danger': '#DC3545',
				'info': '#17A2B8',
				'warning': '#FFC107'
			},
			fontFamily: {
				playfair: ['"Playfair Display"', 'serif'],
				bebas: ['"Bebas Neue"', 'sans-serif'],
				inter: ['"Inter"', 'sans-serif'],
				courier: ['"Courier New"', 'monospace']
			}
		}
	},
	plugins: [
		forms,
		typography,
		daisyui
	],
	daisyui: {
		themes: false, // Отключаем стандартные темы, используем кастомные стили
		logs: false
	}
};
