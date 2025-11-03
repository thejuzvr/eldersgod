import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { loginUser } from '$lib/server/auth';
import { z } from 'zod';

const loginSchema = z.object({
	email: z.string().email('Некорректный email'),
	password: z.string().min(1, 'Введите пароль')
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		
		// Валидация
		const validated = loginSchema.parse(body);
		
		// Вход
		const { user, hero, token } = await loginUser(
			validated.email,
			validated.password
		);
		
		// Устанавливаем cookie с токеном
		cookies.set('auth_token', token, {
			path: '/',
			httpOnly: true,
			sameSite: 'strict',
			secure: process.env.NODE_ENV === 'production',
			maxAge: 60 * 60 * 24 * 7 // 7 дней
		});
		
		return json({
			success: true,
			user: {
				id: user.id,
				email: user.email
			},
			hero: {
				id: hero.id,
				name: hero.name,
				race: hero.race,
				level: hero.level,
				title: hero.title
			}
		});
		
	} catch (error: any) {
		console.error('Login error:', error);
		
		if (error.name === 'ZodError') {
			return json({
				success: false,
				error: error.errors[0].message
			}, { status: 400 });
		}
		
		return json({
			success: false,
			error: error.message || 'Ошибка входа'
		}, { status: 400 });
	}
};

