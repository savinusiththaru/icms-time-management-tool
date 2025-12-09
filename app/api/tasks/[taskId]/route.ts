import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { sendNotification } from '@/lib/notifications';

// Validation for PATCH
const updateTaskSchema = z.object({
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
    title: z.string().min(3).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
});

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> } // Params is a Promise in Next 15+ (Next 16)
) {
    try {
        const { taskId } = await params;

        // Optional: Check if task exists and ownership (stubbed)

        // Check if it's part of a recurring series (for info only, we just delete the instance)
        const task = await prisma.task.findUnique({ where: { id: taskId } });
        if (!task) return NextResponse.json({ error: 'Not Found' }, { status: 404 });

        await prisma.task.delete({
            where: { id: taskId },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete Task Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ taskId: string }> }
) {
    try {
        const { taskId } = await params;
        const body = await req.json();

        const validation = updateTaskSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.flatten() }, { status: 400 });
        }

        const task = await prisma.task.update({
            where: { id: taskId },
            data: validation.data,
        });

        // Notify if completed?
        if (validation.data.status === 'COMPLETED') {
            sendNotification(task.creatorId, 'GENERATED', { // Reusing GENERATED type for generic alert or add 'STATUS_CHANGE'
                title: `Task Completed: ${task.title}`,
                status: 'COMPLETED'
            });
        }

        return NextResponse.json({ data: task });
    } catch (error: any) {
        console.error('Update Task Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
