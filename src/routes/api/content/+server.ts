import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContentService } from '$lib/services/contentService';
import { ContentFilterSchema, ContentSearchOptionsSchema } from '$lib/utils/contentValidators';
import { getUserFromCookie } from '$lib/server/auth';

/**
 * GET /api/content
 * Получить контент с пагинацией и фильтрацией
 */
export const GET: RequestHandler = async ({ url, cookies }) => {
    try {
        // Проверяем авторизацию (пока опционально для демо)
        const authData = await getUserFromCookie({ cookies } as any).catch(() => null);
        
        // Парсим параметры запроса
        const filterParams = {
            type: url.searchParams.get('type') || undefined,
            category: url.searchParams.get('category') || undefined,
            active: url.searchParams.get('active') ? url.searchParams.get('active') === 'true' : undefined,
            rarity: url.searchParams.get('rarity') || undefined,
            tags: url.searchParams.get('tags')?.split(',') || undefined,
            minWeight: url.searchParams.get('minWeight') ? Number(url.searchParams.get('minWeight')) : undefined,
            maxWeight: url.searchParams.get('maxWeight') ? Number(url.searchParams.get('maxWeight')) : undefined,
            unlockLevel: url.searchParams.get('unlockLevel') ? Number(url.searchParams.get('unlockLevel')) : undefined,
            language: url.searchParams.get('language') || undefined
        };

        const searchOptions = {
            filter: ContentFilterSchema.parse(filterParams),
            sortBy: (url.searchParams.get('sortBy') as any) || 'name',
            sortOrder: (url.searchParams.get('sortOrder') as any) || 'asc',
            limit: url.searchParams.get('limit') ? Number(url.searchParams.get('limit')) : 20,
            offset: url.searchParams.get('offset') ? Number(url.searchParams.get('offset')) : 0,
            includeAnalytics: url.searchParams.get('includeAnalytics') === 'true',
            includeTranslations: url.searchParams.get('includeTranslations') === 'true'
        };

        // Валидируем опции поиска
        ContentSearchOptionsSchema.parse(searchOptions);

        const result = await ContentService.searchContent(searchOptions);

        return json({
            success: true,
            data: result
        });

    } catch (error) {
        console.error('Error fetching content:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
    }
};

/**
 * POST /api/content
 * Создать новый контент
 */
export const POST: RequestHandler = async ({ request, cookies }) => {
    try {
        // Проверяем авторизацию
        const authData = await getUserFromCookie({ cookies } as any);
        if (!authData) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        
        // Валидируем данные
        const validatedContent = ContentFilterSchema.parse(body);

        // Добавляем метаданные
        const newContent = {
            ...validatedContent,
            createdBy: authData.user.id,
            isActive: true,
            createdAt: new Date()
        };

        const created = await ContentService.createContent(newContent as any);

        return json({
            success: true,
            data: created
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating content:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 400 });
    }
};