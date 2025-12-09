import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params;

        // Use a transaction to ensure all deletions happen together
        await prisma.$transaction(async (tx) => {
            // 1. Delete all TaskAssignee relationships
            await tx.taskAssignee.deleteMany({
                where: { userId: userId }
            });

            // 2. Delete all tasks created by this user
            await tx.task.deleteMany({
                where: { creatorId: userId }
            });

            // 3. Finally delete the user
            await tx.user.delete({
                where: { id: userId }
            });
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete user error:', error);
        return NextResponse.json({
            error: error.message || 'Failed to delete user'
        }, { status: 500 });
    }
}
