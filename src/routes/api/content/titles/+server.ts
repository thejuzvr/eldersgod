import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContentService } from '$lib/services/contentService';

/**
 * GET /api/content/titles
 * Получить случайный титул или список титулов
 */
export const GET: RequestHandler = async ({ url }) => {
    try {
        const type = 'title';
        const count = url.searchParams.get('count');
        const level = url.searchParams.get('level') ? Number(url.searchParams.get('level')) : undefined;

        if (count === '1' || !count) {
            // Получаем случайный титул
            const title = await ContentService.getRandomTitle(level);
            return json({
                success: true,
                data: { title }
            });
        } else {
            // Получаем список титулов
            const filter: any = { active: true };
            if (level) {
                filter.unlockLevel = level;
            }

            const result = await ContentService.searchContent({
                filter,
                limit: Number(count) || 20,
                sortBy: 'name',
                sortOrder: 'asc',
                offset: 0,
                includeAnalytics: false,
                includeTranslations: false
            });

            return json({
                success: true,
                data: {
                    titles: result.items.map((item: any) => item.name),
                    total: result.total
                }
            });
        }

    } catch (error) {
        console.error('Error fetching titles:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};