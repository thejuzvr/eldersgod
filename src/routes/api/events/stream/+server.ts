import type { RequestHandler } from './$types';
import { subscribeToHeroEvents } from '$lib/server/redis';

export const GET: RequestHandler = async ({ url }) => {
	const heroId = parseInt(url.searchParams.get('heroId') || '0');
	
	if (!heroId) {
		return new Response('Missing heroId', { status: 400 });
	}
	
	let subscriber: any = null;
	let keepaliveInterval: NodeJS.Timeout | null = null;
	
	const stream = new ReadableStream({
		async start(controller) {
			// Отправляем начальное сообщение
			controller.enqueue(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);
			
			// Подписываемся на события героя
			subscriber = await subscribeToHeroEvents(heroId, (event) => {
				// Проверяем, что контроллер не закрыт перед отправкой
				if (controller.desiredSize !== null) {
					try {
						controller.enqueue(`data: ${JSON.stringify({ type: 'event', event })}\n\n`);
					} catch (error) {
						console.error('Error sending event:', error);
					}
				}
			});
			
			// Функция для отправки keepalive
			keepaliveInterval = setInterval(() => {
				// Проверяем, что контроллер не закрыт
				if (controller.desiredSize !== null) {
					try {
						controller.enqueue(': keepalive\n\n');
					} catch (error) {
						console.error('Error sending keepalive:', error);
						if (keepaliveInterval) {
							clearInterval(keepaliveInterval);
						}
					}
				} else {
					// Контроллер закрыт, останавливаем keepalive
					if (keepaliveInterval) {
						clearInterval(keepaliveInterval);
					}
				}
			}, 30000); // Каждые 30 секунд
		},
		
		// Cleanup при закрытии соединения клиентом
		cancel() {
			if (keepaliveInterval) {
				clearInterval(keepaliveInterval);
				keepaliveInterval = null;
			}
			if (subscriber) {
				subscriber.quit().catch((err: any) => {
					console.error('Error closing Redis subscriber:', err);
				});
				subscriber = null;
			}
		}
	});
	
	return new Response(stream, {
		headers: {
			'Content-Type': 'text/event-stream',
			'Cache-Control': 'no-cache',
			'Connection': 'keep-alive'
		}
	});
};

