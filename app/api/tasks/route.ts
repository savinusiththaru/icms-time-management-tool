import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { startOfWeek, parseISO, isMonday, isValid } from 'date-fns';
import { sendNotification } from '@/lib/notifications';

// -------------------------------------------------------------
// Validation Schemas
// -------------------------------------------------------------

const createTaskSchema = z.object({
    title: z
        .string()
        .min(3, 'Title must be at least 3 characters')
        .max(100, 'Title too long'),
    description: z.string().max(2000).optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).default('MEDIUM'),
    assigneeIds: z.array(z.string().uuid()),
    weekStart: z.string().refine((date) => {
        const d = parseISO(date);
        return isValid(d) && isMonday(d);
    }, 'Week Start must be a valid Monday (YYYY-MM-DD)'),
    dueTime: z.string().refine((date) => isValid(new Date(date)), 'Invalid Due Time'),
    tags: z.array(z.string()).default([]),
    recurrence: z
        .object({
            enabled: z.boolean(),
            intervalWeeks: z.number().min(1).default(1),
            dayOfWeek: z.number().min(0).max(6),
            endDate: z.string().optional(),
        })
        .optional(),
});

// -------------------------------------------------------------
// POST Handler
// -------------------------------------------------------------

export async function POST(req: Request) {
    try {
        // 1. Auth Stub (Replace with real session check later)
        // const session = await getServerSession(authOptions);
        // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // Temp: simulating user
        const mockUser = { id: 'temp-user-id', companyId: 'temp-company-id' };

        // 2. Parse & Validate
        const body = await req.json();
        const validation = createTaskSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: 'Validation Failed', details: validation.error.flatten() },
                { status: 400 }
            );
        }

        const { title, weekStart, dueTime, priority, assigneeIds, tags, recurrence, description } =
            validation.data;

        const weekStartDate = new Date(weekStart);

        // 3. Conflict Check
        const existing = await prisma.task.findFirst({
            where: {
                title,
                companyId: mockUser.companyId,
                weekStart: weekStartDate,
                // If strict recurrence checking is needed, check for recurringTaskId matches too
            },
        });

        if (existing) {
            return NextResponse.json(
                {
                    error: 'Conflict',
                    message: 'A task with this title already exists for the specified week.',
                },
                { status: 409 }
            );
        }

        // 4. Create Task (Transaction for atomicity with RecurringTask if needed)
        // Since we are using SQLite/Prisma, $transaction is supported.

        const result = await prisma.$transaction(async (tx: any) => { // Using any for simplicity with Prisma 5/7 mismatch types, or import Prisma.TransactionClient
            // Ensure Creator exists (Stubbing user creation if not exists for this demo)
            let user = await tx.user.findUnique({ where: { id: mockUser.id } });
            if (!user) {
                // Create dummy user and company for demo
                user = await tx.user.create({
                    data: {
                        id: mockUser.id,
                        email: 'demo@example.com',
                        name: 'Demo User',
                        companyId: mockUser.companyId,
                    },
                });
            }

            let recurringTaskId = null;

            // Create Master Recurring Task if enabled
            if (recurrence?.enabled) {
                const master = await tx.recurringTask.create({
                    data: {
                        title,
                        description,
                        priority,
                        companyId: mockUser.companyId,
                        creatorId: user.id,
                        intervalWeeks: recurrence.intervalWeeks,
                        dayOfWeek: recurrence.dayOfWeek,
                        endDate: recurrence.endDate ? new Date(recurrence.endDate) : null,
                    },
                });
                recurringTaskId = master.id;
            }

            // Handle Tags
            // Connect or create tags
            const tagConnectors = tags.map((t) => ({
                where: { name: t },
                create: { name: t },
            }));

            // Create The Instance
            const task = await tx.task.create({
                data: {
                    title,
                    description,
                    priority,
                    status: 'PENDING',
                    weekStart: weekStartDate,
                    dueAt: new Date(dueTime),
                    recurringTaskId,
                    companyId: mockUser.companyId,
                    creatorId: user.id,
                    // Assignees connection (assuming they exist, otherwise we skip for this demo or create dummy)
                    assignees: {
                        create: assigneeIds.map((uid) => ({
                            user: {
                                connectOrCreate: {
                                    where: { id: uid },
                                    create: { id: uid, email: `user-${uid}@test.com`, name: `User ${uid}`, companyId: mockUser.companyId }
                                }
                            }
                        })),
                    },
                    tags: {
                        connectOrCreate: tagConnectors,
                    },
                },
                include: {
                    assignees: true,
                    tags: true,
                },
            });

            return task;
        });

        // Notify Assignees
        if (assigneeIds.length > 0) {
            assigneeIds.forEach(uid => {
                sendNotification(uid, 'ASSIGNED', { taskId: result.id, title: title });
            });
        }

        return NextResponse.json({ data: result }, { status: 201 });
    } catch (error: any) {
        console.error('Create Task Error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error', message: error.message },
            { status: 500 }
        );
    }
}
