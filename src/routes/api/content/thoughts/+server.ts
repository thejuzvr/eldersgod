import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContentService } from '$lib/server/contentService';

/**
 * GET /api/content/thoughts
 * Получить случайную мысль или список мыслей
 */
export const GET: RequestHandler = async ({ url }) => {
    try {
        const category = url.searchParams.get('category');
        const count = url.searchParams.get('count');

        if (count === '1' || !count) {
            // Получаем случайную мысль
            const thought = await ContentService.getRandomThought(category || undefined);
            return json({
                success: true,
                data: { thought }
            });
        } else {
            // Получаем список мыслей
            const filter: any = { active: true, type: 'thought' };
            if (category) {
                filter.category = category;
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
                    thoughts: result.items.map((item: any) => item.text),
                    total: result.total
                }
            });
        }

    } catch (error) {
        console.error('Error fetching thoughts:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};