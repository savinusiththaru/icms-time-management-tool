import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const createUserSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    email: z.string().email('Invalid email'),
});

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const json = await req.json();
        const data = createUserSchema.parse(json);

        // Check consistency/uniqueness
        const existing = await prisma.user.findUnique({
            where: { email: data.email }
        });

        if (existing) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }

        const user = await prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                companyId: 'default-company', // Hardcoded for single-tenant simplified usage
            }
        });

        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
