import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { ContentService } from '$lib/server/contentService';
import { getUserFromCookie } from '$lib/server/auth';

/**
 * GET /api/content/[id]
 * Получить конкретный элемент контента
 */
export const GET: RequestHandler = async ({ params, cookies }) => {
    try {
        const id = Number(params.id);
        
        if (!id || isNaN(id)) {
            return json({ 
                success: false, 
                error: 'Invalid content ID' 
            }, { status: 400 });
        }

        // Загружаем контент
        const result = await ContentService.loadContent('any', {
            filter: { active: true },
            limit: 1000
        });

        const item = result.items.find((c: any) => c.id === id);
        
        if (!item) {
            return json({ 
                success: false, 
                error: 'Content not found' 
            }, { status: 404 });
        }

        // Отслеживаем просмотр
        await ContentService.trackUsage(id);

        return json({
            success: true,
            data: item
        });

    } catch (error) {
        console.error('Error fetching content item:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};

/**
 * PUT /api/content/[id]
 * Обновить элемент контента
 */
export const PUT: RequestHandler = async ({ params, request, cookies }) => {
    try {
        // Проверяем авторизацию
        const authData = await getUserFromCookie({ cookies } as any);
        if (!authData) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = Number(params.id);
        
        if (!id || isNaN(id)) {
            return json({ 
                success: false, 
                error: 'Invalid content ID' 
            }, { status: 400 });
        }

        const body = await request.json();
        
        // Обновляем контент
        const updated = await ContentService.updateContent(id, {
            ...body,
            updatedAt: new Date()
        });

        return json({
            success: true,
            data: updated
        });

    } catch (error) {
        console.error('Error updating content:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};

/**
 * DELETE /api/content/[id]
 * Удалить элемент контента (мягкое удаление)
 */
export const DELETE: RequestHandler = async ({ params, cookies }) => {
    try {
        // Проверяем авторизацию
        const authData = await getUserFromCookie({ cookies } as any);
        if (!authData) {
            return json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const id = Number(params.id);
        
        if (!id || isNaN(id)) {
            return json({ 
                success: false, 
                error: 'Invalid content ID' 
            }, { status: 400 });
        }

        // Мягкое удаление
        await ContentService.deleteContent(id);

        return json({
            success: true,
            message: 'Content deactivated successfully'
        });

    } catch (error) {
        console.error('Error deleting content:', error);
        return json({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
};