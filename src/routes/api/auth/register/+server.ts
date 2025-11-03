import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { registerUser } from '$lib/server/auth';
import { z } from 'zod';

const registerSchema = z.object({
	email: z.string().email('Некорректный email'),
	password: z.string().min(6, 'Пароль должен быть не менее 6 символов'),
	heroName: z.string().min(2, 'Имя героя должно быть не менее 2 символов').max(50, 'Имя героя слишком длинное'),
	heroRace: z.enum(['Nord', 'Dark Elf', 'High Elf', 'Wood Elf', 'Khajiit', 'Argonian', 'Breton', 'Imperial', 'Redguard', 'Orc'])
});

export const POST: RequestHandler = async ({ request, cookies }) => {
	try {
		const body = await request.json();
		
		// Валидация
		const validated = registerSchema.parse(body);
		
		// Регистрация
		const { user, hero, token } = await registerUser(
			validated.email,
			validated.password,
			validated.heroName,
			validated.heroRace
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
		console.error('Registration error:', error);
		
		if (error.name === 'ZodError') {
			return json({
				success: false,
				error: error.errors[0].message
			}, { status: 400 });
		}
		
		return json({
			success: false,
			error: error.message || 'Ошибка регистрации'
		}, { status: 400 });
	}
};

