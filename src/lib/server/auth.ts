import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import { db } from './db';
import { users, heroes } from './db/schema';
import { eq } from 'drizzle-orm';
import type { RequestEvent } from '@sveltejs/kit';

const SALT_ROUNDS = 10;
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
	userId: number;
	email: string;
	heroId?: number;
}

/**
 * Хэшировать пароль
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Проверить пароль
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

/**
 * Создать JWT токен
 */
export function createToken(payload: JWTPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

/**
 * Верифицировать JWT токен
 */
export function verifyToken(token: string): JWTPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JWTPayload;
	} catch (error) {
		return null;
	}
}

/**
 * Получить пользователя из токена в cookies
 */
export async function getUserFromCookie(event: RequestEvent): Promise<{ user: any; hero: any } | null> {
	const token = event.cookies.get('auth_token');
	
	if (!token) return null;
	
	const payload = verifyToken(token);
	if (!payload) return null;
	
	const user = await db.query.users.findFirst({
		where: eq(users.id, payload.userId)
	});
	
	if (!user) return null;
	
	// Получаем героя пользователя
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.userId, user.id)
	});
	
	return { user, hero };
}

/**
 * Middleware для проверки авторизации
 */
export async function requireAuth(event: RequestEvent) {
	const authData = await getUserFromCookie(event);
	
	if (!authData) {
		throw new Error('Unauthorized');
	}
	
	return authData;
}

/**
 * Регистрация нового пользователя
 */
export async function registerUser(email: string, password: string, heroName: string, heroRace: string) {
	// Проверяем, существует ли пользователь
	const existingUser = await db.query.users.findFirst({
		where: eq(users.email, email)
	});
	
	if (existingUser) {
		throw new Error('User with this email already exists');
	}
	
	// Хэшируем пароль
	const passwordHash = await hashPassword(password);
	
	// Создаём пользователя
	const [newUser] = await db.insert(users).values({
		email,
		passwordHash,
		lastLogin: new Date()
	}).returning();
	
	// Создаём героя
	const [newHero] = await db.insert(heroes).values({
		userId: newUser.id,
		name: heroName,
		race: heroRace,
		title: getRandomStartingTitle()
	}).returning();
	
	// Создаём токен
	const token = createToken({
		userId: newUser.id,
		email: newUser.email,
		heroId: newHero.id
	});
	
	return { user: newUser, hero: newHero, token };
}

/**
 * Вход пользователя
 */
export async function loginUser(email: string, password: string) {
	// Находим пользователя
	const user = await db.query.users.findFirst({
		where: eq(users.email, email)
	});
	
	if (!user) {
		throw new Error('Invalid email or password');
	}
	
	// Проверяем пароль
	const isValid = await verifyPassword(password, user.passwordHash);
	
	if (!isValid) {
		throw new Error('Invalid email or password');
	}
	
	// Обновляем последний вход
	await db.update(users)
		.set({ lastLogin: new Date() })
		.where(eq(users.id, user.id));
	
	// Получаем героя
	const hero = await db.query.heroes.findFirst({
		where: eq(heroes.userId, user.id)
	});
	
	if (!hero) {
		throw new Error('Hero not found');
	}
	
	// Создаём токен
	const token = createToken({
		userId: user.id,
		email: user.email,
		heroId: hero.id
	});
	
	return { user, hero, token };
}

/**
 * Получить случайный стартовый титул
 */
function getRandomStartingTitle(): string {
	const titles = [
		'Новичок',
		'Неопытный Странник',
		'Начинающий Авантюрист',
		'Юный Герой',
		'Искатель Приключений'
	];
	
	return titles[Math.floor(Math.random() * titles.length)];
}

