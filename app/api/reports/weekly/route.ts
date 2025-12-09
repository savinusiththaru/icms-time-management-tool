import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek, parseISO, isValid, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const dateParam = searchParams.get('date');

        if (!dateParam) {
            return NextResponse.json({ error: 'Missing date parameter' }, { status: 400 });
        }

        const date = parseISO(dateParam);
        if (!isValid(date)) {
            return NextResponse.json({ error: 'Invalid date parameter' }, { status: 400 });
        }

        // Determine Week Range (Monday to Sunday)
        // Ensure we are looking at the same "weekStart" logic as creation
        const weekStart = startOfWeek(date, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(date, { weekStartsOn: 1 });

        // Fetch Tasks
        // We filter by weekStart date stored in DB.
        // The DB stores weekStart as a DateTime at 00:00:00 (usually)
        // We match strictly on weekStart for simplicity as per our data model
        const weekStartStr = format(weekStart, 'yyyy-MM-dd');

        // However, Prisma stores DateTime. Let's use range or direct match if possible.
        // Our create logic stores `weekStart` as a Date object set from a formatted string (yyyy-MM-dd).
        // So essentially it is midnight on that date.

        const tasks = await prisma.task.findMany({
            where: {
                // We use a range to be safe against time components, though our app tries to keep them clean.
                weekStart: {
                    gte: weekStart,
                    lte: weekEnd
                }
            },
            orderBy: {
                priority: 'desc' // HIGH first
            }
        });

        // Calculate Stats
        const total = tasks.length;
        const completed = tasks.filter((t: any) => t.status === 'COMPLETED').length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        // Categorize
        const highlights = tasks
            .filter((t: any) => t.status === 'COMPLETED')
            .map((t: any) => ({ id: t.id, title: t.title, priority: t.priority }));

        const actionItems = tasks
            .filter((t: any) => t.status !== 'COMPLETED')
            .map((t: any) => ({ id: t.id, title: t.title, priority: t.priority }));

        return NextResponse.json({
            meta: {
                weekStart: weekStartStr,
                generatedAt: new Date().toISOString()
            },
            stats: {
                total,
                completed,
                pending,
                completionRate
            },
            highlights,
            actionItems
        });

    } catch (error: any) {
        console.error('Report Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
