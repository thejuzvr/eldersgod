import type { Handle } from '@sveltejs/kit';
import { getUserFromCookie } from '$lib/server/auth';
import { startEventQueueProcessor } from '$lib/server/eventQueue';
import { startIdleDetector } from '$lib/game/idleDetector';

// Запускаем обработчики при старте сервера
let systemsStarted = false;
if (!systemsStarted) {
	startEventQueueProcessor();
	startIdleDetector();
	systemsStarted = true;
}

export const handle: Handle = async ({ event, resolve }) => {
	// Попытка получить пользователя из cookie
	const authData = await getUserFromCookie(event);
	
	if (authData) {
		event.locals.user = authData.user;
		event.locals.hero = authData.hero;
	}
	
	return resolve(event);
};

