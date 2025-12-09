import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getNeededOccurrences } from '@/lib/recurrence';
import { isBefore, setDay, setHours, setMinutes, format } from 'date-fns';
import { sendNotification } from '@/lib/notifications';

export async function POST(req: Request) {
    try {
        // 1. Fetch all recurring master tasks
        const recurringTasks = await prisma.recurringTask.findMany({
            include: {
                tasks: {
                    orderBy: { weekStart: 'desc' },
                    take: 1
                }
            }
        });

        let createdCount = 0;

        // 2. Iterate and generate
        for (const master of recurringTasks) {
            // Find the last generated weekStart
            const lastInstance = master.tasks[0];
            // If no instance exists (shouldn't happen if created via API correctly, but handle it), start from creation date aligned to Monday
            const lastDate = lastInstance ? new Date(lastInstance.weekStart) : new Date(master.createdAt);

            // Calculate needed dates (maintain 4 weeks buffer)
            const neededDates = getNeededOccurrences(lastDate, master.intervalWeeks, 4);

            for (const weekStart of neededDates) {
                // Check endDate constraint
                if (master.endDate && isBefore(new Date(master.endDate), weekStart)) {
                    continue;
                }

                // Check for conflicts (idempotency safety)
                const exists = await prisma.task.findFirst({
                    where: {
                        title: master.title,
                        companyId: master.companyId,
                        weekStart: weekStart
                    }
                });

                if (exists) continue;

                // Create the task instance
                // We need to calculate DueTime.
                // For simplicity, let's assume dueTime is relative to the dayOfWeek of the master task
                // But master doesn't store time, only existing tasks do. 
                // We'll Default to 5 PM on the dayOfWeek.

                const dueDay = master.dayOfWeek;
                // weekStart is Monday (1). 
                // If dayOfWeek is 1 (Mon), it's same day.
                // If dayOfWeek is 5 (Fri), it's weekStart + 4 days.

                let dueDate = setDay(weekStart, dueDay);
                // If dueDay < 1 (e.g. 0 Sunday), setDay might move it to previous week depending on locale options, 
                // but weekStart (Mon) setDay(0) usually goes to previous Sunday or Next Sunday. 
                // Let's use date-fns `setDay` with weekStartsOn: 1 (Monday)
                dueDate = setDay(weekStart, dueDay, { weekStartsOn: 1 });

                dueDate = setHours(setMinutes(dueDate, 0), 17); // 5:00 PM default

                await prisma.task.create({
                    data: {
                        title: master.title,
                        description: master.description,
                        priority: master.priority,
                        status: 'PENDING',
                        weekStart: weekStart,
                        dueAt: dueDate,
                        recurringTaskId: master.id,
                        companyId: master.companyId,
                        creatorId: master.creatorId,
                        // Assignees: strict copy from master? Master doesn't link assignees in schema yet.
                        // We'll skip adding assignees for auto-generated tasks for this iteration unless we add relation to Master.
                    }
                });

                // Notify Creator
                sendNotification(master.creatorId, 'GENERATED', {
                    title: master.title,
                    weekStart: weekStart.toISOString()
                });

                createdCount++;
            }
        }

        return NextResponse.json({ success: true, created: createdCount });
    } catch (error: any) {
        console.error('Generator Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
