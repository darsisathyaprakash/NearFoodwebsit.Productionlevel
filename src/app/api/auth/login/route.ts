import { NextRequest, NextResponse } from 'next/server';
import { insforge } from '@/lib/insforge';
import { loginSchema } from '@/utils/api-validation';
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const validated = loginSchema.parse(body);
        const { email, password } = validated;

        const { data, error } = await insforge.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            // Generic error message to prevent user enumeration
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ZodError) {
            return NextResponse.json(
                { error: error.issues[0].message },
                { status: 400 }
            );
        }
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'An error occurred during login' },
            { status: 500 }
        );
    }
}
