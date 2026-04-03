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
				// CSS переменные будут задаваться в app.css для поддержки тем
				'bg-primary': 'var(--bg-primary)',
				'bg-secondary': 'var(--bg-secondary)',
				'bg-tertiary': 'var(--bg-tertiary)',
				'border-light': 'var(--border-light)',
				'border-medium': 'var(--border-medium)',
				'border-dark': 'var(--border-dark)',
				'text-primary': 'var(--text-primary)',
				'text-secondary': 'var(--text-secondary)',
				'text-muted': 'var(--text-muted)',
				'accent-primary': 'var(--accent-primary)',
				'accent-secondary': 'var(--accent-secondary)',
				'success': 'var(--success)',
				'danger': 'var(--danger)',
				'info': 'var(--info)',
				'warning': 'var(--warning)'
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
		themes: false,
		logs: false
	}
};
